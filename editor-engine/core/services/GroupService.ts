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

export class GroupService {
  constructor(private readonly document: Document) {}

  /**
   * Group multiple nodes into a new group node
   * Returns the ID of the newly created group
   */
  groupNodes(nodeIds: string[]): string | null {
    const normalizedIds = this.normalizeSelectionForGrouping(nodeIds)
    if (!this.hasEnoughNodesToGroup(normalizedIds)) {
      return null
    }

    const nodes: Node[] = []
    for (const id of normalizedIds) {
      const node = this.document.getNode(id)
      if (!node) {
        return null
      }
      nodes.push(node)
    }

    const commonParentId = this.getGroupingParentId(normalizedIds)
    if (commonParentId === null) {
      return null
    }

    // Calculate bounding box of all selected nodes in world space
    const bounds = this.calculateBoundingBox(normalizedIds)
    if (!bounds) {
      return null
    }

    // Create group node at the center of the bounding box
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

    // Store the original bounding box dimensions
    groupNode.boundingBox = {
      width: bounds.width,
      height: bounds.height,
    }

    // Find the highest z-order index among selected nodes
    const allNodes = this.document.getAllNodes()
    let maxZIndex = -1

    for (const nodeId of normalizedIds) {
      const index = allNodes.findIndex((n) => n.id === nodeId)
      if (index > maxZIndex) {
        maxZIndex = index
      }
    }

    // Add the group node to the document
    this.document.addNode(groupNode)

    // Move to correct z-order position (at the highest z-order of selected nodes)
    if (maxZIndex >= 0) {
      this.document.setNodeZOrder(groupNode.id, maxZIndex)
    }

    // Reparent all selected nodes to the new group, preserving their z-order
    // NOTE: We keep transforms in world space since the renderer doesn't support hierarchical transforms

    // Sort nodes by their current z-order (index in allNodes array)
    const nodesByZOrder = nodes
      .map((node) => ({
        node,
        zIndex: allNodes.findIndex((n) => n.id === node.id),
      }))
      .sort((a, b) => a.zIndex - b.zIndex)

    // Reparent in z-order (lowest to highest)
    for (const { node } of nodesByZOrder) {
      // Reparent to the group without modifying transforms
      this.document.reparent(node.id, groupId)
    }

    return groupId
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
    const childIds = [...groupNode.children] // Copy array before modifying

    // Move each child to the group's parent
    // NOTE: Transforms are already in world space, so no adjustment needed
    for (const childId of childIds) {
      const child = this.document.getNode(childId)
      if (!child) continue

      // Reparent to the group's parent (transforms stay in world space)
      this.document.reparent(childId, parentId)
    }

    // Remove the now-empty group
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

  /** Need 2+ nodes, or a single shape/group (wrap it in a new parent group). */
  private hasEnoughNodesToGroup(normalizedIds: string[]): boolean {
    if (normalizedIds.length >= 2) return true
    if (normalizedIds.length !== 1) return false
    const node = this.document.getNode(normalizedIds[0])
    if (!node) return false
    return isGroupNode(node) || isShapeNode(node)
  }

  /**
   * Keep only top-level selected nodes: drop descendants of another selected node,
   * and replace a full leaf selection of a group with the group node itself.
   */
  private normalizeSelectionForGrouping(nodeIds: string[]): string[] {
    const uniqueIds = [...new Set(nodeIds)]

    const withoutDescendants = uniqueIds.filter(
      (id) =>
        !uniqueIds.some(
          (otherId) => otherId !== id && this.isDescendantOf(id, otherId),
        ),
    )

    const collapsed = this.collapseFullySelectedGroups(withoutDescendants)

    return collapsed.filter(
      (id) =>
        !collapsed.some(
          (otherId) => otherId !== id && this.isDescendantOf(id, otherId),
        ),
    )
  }

  /**
   * When every shape in a group is selected (but the group node is not), treat the group as selected.
   */
  private collapseFullySelectedGroups(nodeIds: string[]): string[] {
    const set = new Set(nodeIds)
    const toRemove = new Set<string>()
    const toAdd = new Set<string>()

    for (const node of this.document.getAllNodes()) {
      if (!isGroupNode(node)) continue

      const leafShapeIds = this.getLeafShapeIds(node.id)
      if (leafShapeIds.length === 0) continue

      const allLeavesSelected = leafShapeIds.every((id) => set.has(id))
      if (allLeavesSelected && !set.has(node.id)) {
        toAdd.add(node.id)
        for (const id of leafShapeIds) {
          toRemove.add(id)
        }
      }
    }

    const result = [...set].filter((id) => !toRemove.has(id))
    for (const id of toAdd) {
      result.push(id)
    }
    return result
  }

  private getLeafShapeIds(nodeId: string): string[] {
    const node = this.document.getNode(nodeId)
    if (!node) return []

    if (isGroupNode(node)) {
      return node.children.flatMap((childId) => this.getLeafShapeIds(childId))
    }

    return this.document.getShape(nodeId) ? [nodeId] : []
  }

  private isDescendantOf(nodeId: string, ancestorId: string): boolean {
    let current = this.document.getNode(nodeId)
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true
      current = this.document.getNode(current.parentId)
    }
    return false
  }

  /**
   * Parent for the new group node. Uses the LCA of the top-level selection so
   * existing groups stay intact as single children (not flattened).
   */
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

    // Selection is under this group but does not include the group itself —
    // place the new group inside it (e.g. grouping two shapes in the same group).
    if (isGroupNode(lcaNode) && !lcaIsBeingGrouped) {
      return lca
    }

    // LCA is one of the nodes being grouped (e.g. a group + sibling, or a
    // single group wrap) — new group is a sibling, not a child of the selection.
    return lcaNode.parentId
  }

  private getPathToRoot(nodeId: string): string[] {
    const path: string[] = ["root"]
    let currentId: string | undefined = nodeId
    while (currentId) {
      path.push(currentId)
      currentId = this.document.getNode(currentId)?.parentId
    }
    return path
  }

  private findLCA(nodeIds: string[]): string {
    const paths = nodeIds.map((id) => this.getPathToRoot(id))
    let lca = "root"
    for (let i = 0; i < paths[0].length; i++) {
      const segment = paths[0][i]
      if (paths.every((p) => p[i] === segment)) {
        lca = segment
      } else {
        break
      }
    }
    return lca
  }

  /**
   * Calculate bounding box for multiple nodes
   * Returns { x, y, width, height } or null if no valid bounds
   */
  private calculateBoundingBox(
    nodeIds: string[],
  ): { x: number; y: number; width: number; height: number } | null {
    const aabbs: AABB[] = []

    for (const nodeId of nodeIds) {
      this.collectNodeAABBs(nodeId, aabbs)
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

  private collectNodeAABBs(nodeId: string, aabbs: AABB[]): void {
    const node = this.document.getNode(nodeId)
    if (!node) return

    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.collectNodeAABBs(childId, aabbs)
      }
      return
    }

    const shape = this.document.getShape(nodeId)
    if (shape) {
      aabbs.push(BoundingBoxService.getAABB(node, shape))
    }
  }
}

// Made with Bob
