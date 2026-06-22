// editor-engine/core/services/GroupService.ts
// Service for grouping and ungrouping nodes

import { Document } from "../Document"
import {
  createGroupNode,
  Node,
  isGroupNode,
  isShapeNode,
  Transform,
} from "../model/Node"
import { BoundingBoxService, AABB } from "./BoundingBoxService"
import type { ZOrderService } from "./ZOrderService"

export class GroupService {
  constructor(
    private readonly document: Document,
    private readonly zOrderService?: ZOrderService,
  ) {}

  /**
   * Group multiple nodes into a new group node
   * Returns the ID of the newly created group and original parent info for undo
   */
  groupNodes(
    nodeIds: string[],
  ): {
    groupId: string
    originalParents: Map<string, string | undefined>
  } | null {
    const normalizedIds = this.normalizeSelectionForGrouping(nodeIds)
    if (!this.hasEnoughNodesToGroup(normalizedIds)) {
      return null
    }

    const nodes: Node[] = []
    const originalParents = new Map<string, string | undefined>()

    for (const id of normalizedIds) {
      const node = this.document.getNode(id)
      if (!node) {
        return null
      }
      nodes.push(node)
      // Store original parent before reparenting
      originalParents.set(id, node.parentId)
    }

    const commonParentId = this.getGroupingParentId(normalizedIds)
    if (commonParentId === null) {
      return null
    }

    const bounds = this.calculateBoundingBox(normalizedIds)
    if (!bounds) {
      return null
    }

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const groupTransform: Transform = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
      rotation: 0,
    }

    const groupNode = createGroupNode(groupId, groupTransform, {
      existingNodes: this.document.getAllNodes(),
      parentId: commonParentId,
    })

    groupNode.boundingBox = {
      width: bounds.width,
      height: bounds.height,
    }

    let maxZIndex = -1
    for (const nodeId of normalizedIds) {
      const index = this.document.getNodeZIndex(nodeId)
      if (index > maxZIndex) {
        maxZIndex = index
      }
    }

    this.document.addNode(groupNode)

    if (maxZIndex >= 0 && this.zOrderService) {
      this.zOrderService.setNodeZOrder(groupNode.id, maxZIndex)
    }

    const nodesByZOrder = nodes
      .map((node) => ({
        node,
        zIndex: this.document.getNodeZIndex(node.id),
      }))
      .sort((a, b) => a.zIndex - b.zIndex)

    for (const { node } of nodesByZOrder) {
      this.document.reparent(node.id, groupId)
    }

    return { groupId, originalParents }
  }

  /**
   * Ungroup a group node, moving its children to the group's parent
   * Returns the IDs of the ungrouped children
   */
  ungroupNode(groupId: string): string[] | null {
    const groupNode = this.document.getNode(groupId)

    if (!groupNode) {
      return null
    }

    if (!isGroupNode(groupNode)) {
      return null
    }

    if (groupNode.children.length === 0) {
      return null
    }

    const parentId = groupNode.parentId
    const childIds = [...groupNode.children]

    for (const childId of childIds) {
      const child = this.document.getNode(childId)
      if (!child) continue

      this.document.reparent(childId, parentId)
    }

    this.document.removeNode(groupId)

    return childIds
  }

  /**
   * Check if a node can be ungrouped
   */
  canUngroup(nodeId: string): boolean {
    const node = this.document.getNode(nodeId)
    return node !== undefined && isGroupNode(node) && node.children.length > 0
  }

  /**
   * Check if multiple nodes can be grouped
   */
  canGroup(nodeIds: string[]): boolean {
    const normalizedIds = this.normalizeSelectionForGrouping(nodeIds)
    if (!this.hasEnoughNodesToGroup(normalizedIds)) return false

    for (const id of normalizedIds) {
      if (!this.document.getNode(id)) return false
    }

    return this.getGroupingParentId(normalizedIds) !== null
  }

  private hasEnoughNodesToGroup(normalizedIds: string[]): boolean {
    if (normalizedIds.length >= 2) return true
    if (normalizedIds.length !== 1) return false
    const node = this.document.getNode(normalizedIds[0])
    if (!node) return false
    return isGroupNode(node) || isShapeNode(node)
  }

  /**
   * Keep only top-level selected nodes: drop descendants of another selected node.
   */
  private normalizeSelectionForGrouping(nodeIds: string[]): string[] {
    const uniqueIds = [...new Set(nodeIds)]

    const ancestorSets = new Map<string, Set<string>>()
    for (const id of uniqueIds) {
      ancestorSets.set(id, this.getAncestorSet(id))
    }

    // Filter out any nodes that are descendants of other selected nodes
    return uniqueIds.filter((id) => {
      const ancestors = ancestorSets.get(id)!
      return !uniqueIds.some(
        (otherId) => otherId !== id && ancestors.has(otherId),
      )
    })
  }

  private getAncestorSet(nodeId: string): Set<string> {
    const ancestors = new Set<string>()
    let current = this.document.getNode(nodeId)
    while (current?.parentId) {
      ancestors.add(current.parentId)
      current = this.document.getNode(current.parentId)
    }
    return ancestors
  }

  private isDescendantOf(nodeId: string, ancestorId: string): boolean {
    let current = this.document.getNode(nodeId)
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true
      current = this.document.getNode(current.parentId)
    }
    return false
  }

  private getGroupingParentId(
    normalizedIds: string[],
  ): string | undefined | null {
    const lca = this.findLCA(normalizedIds)
    if (lca === "root") {
      return undefined
    }

    const lcaNode = this.document.getNode(lca)
    if (!lcaNode) return null

    const lcaIsBeingGrouped = normalizedIds.includes(lca)

    if (isGroupNode(lcaNode) && !lcaIsBeingGrouped) {
      return lca
    }

    return lcaNode.parentId
  }

  private getPathToRoot(nodeId: string): string[] {
    const path: string[] = []
    let currentId: string | undefined = nodeId

    while (currentId) {
      path.push(currentId)
      currentId = this.document.getNode(currentId)?.parentId
    }

    path.push("root")
    return path.reverse()
  }

  private findLCA(nodeIds: string[]): string {
    if (nodeIds.length === 0) return "root"
    if (nodeIds.length === 1) {
      const node = this.document.getNode(nodeIds[0])
      return node?.parentId ?? "root"
    }

    const firstPath = this.getPathToRoot(nodeIds[0])
    let lca = "root"

    for (let i = 0; i < firstPath.length; i++) {
      const segment = firstPath[i]
      let allMatch = true

      for (let j = 1; j < nodeIds.length; j++) {
        if (!this.isAncestorOrSelf(segment, nodeIds[j])) {
          allMatch = false
          break
        }
      }

      if (allMatch) {
        lca = segment
      } else {
        break
      }
    }

    return lca
  }

  private isAncestorOrSelf(ancestorId: string, nodeId: string): boolean {
    if (ancestorId === nodeId) return true
    if (ancestorId === "root") return true

    let current = this.document.getNode(nodeId)
    while (current) {
      if (current.id === ancestorId) return true
      if (!current.parentId) break
      current = this.document.getNode(current.parentId)
    }
    return false
  }

  /**
   * Calculate bounding box for multiple nodes
   */
  private calculateBoundingBox(
    nodeIds: string[],
  ): { x: number; y: number; width: number; height: number } | null {
    const aabbs: AABB[] = []
    const aabbCache = new Map<string, AABB>()

    for (const nodeId of nodeIds) {
      this.collectNodeAABBs(nodeId, aabbs, aabbCache)
    }

    if (aabbs.length === 0) return null

    const union = BoundingBoxService.unionAABBs(aabbs)

    return {
      x: union.minX,
      y: union.minY,
      width: union.maxX - union.minX,
      height: union.maxY - union.minY,
    }
  }

  private collectNodeAABBs(
    nodeId: string,
    aabbs: AABB[],
    cache: Map<string, AABB>,
  ): void {
    const stack = [nodeId]

    while (stack.length > 0) {
      const currentId = stack.pop()!

      if (cache.has(currentId)) {
        aabbs.push(cache.get(currentId)!)
        continue
      }

      const node = this.document.getNode(currentId)
      if (!node) continue

      if (isGroupNode(node)) {
        stack.push(...node.children)
      } else {
        const shape = this.document.getShape(currentId)
        if (shape) {
          const aabb = BoundingBoxService.getAABB(node, shape)
          cache.set(currentId, aabb)
          aabbs.push(aabb)
        }
      }
    }
  }
}

// Made with Bob
