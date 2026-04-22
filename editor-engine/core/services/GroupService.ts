// editor-engine/core/services/GroupService.ts
// Service for grouping and ungrouping nodes

import { Document } from "../Document"
import { createGroupNode, Node, isGroupNode, Transform } from "../model/Node"
import { BoundingBoxService, AABB } from "./BoundingBoxService"

export class GroupService {
  constructor(private readonly document: Document) {}

  /**
   * Group multiple nodes into a new group node
   * Returns the ID of the newly created group
   */
  groupNodes(nodeIds: string[]): string | null {
    // Validate input
    if (nodeIds.length < 2) {
      return null
    }

    // Get all nodes and validate they exist
    const nodes: Node[] = []
    for (const id of nodeIds) {
      const node = this.document.getNode(id)
      if (!node) {
        return null
      }
      nodes.push(node)
    }

    // Check if all nodes have the same parent (or all are root-level)
    const parentIds = new Set(nodes.map((n) => n.parentId ?? "root"))
    if (parentIds.size > 1) {
      return null
    }

    const commonParentId = nodes[0].parentId

    // Calculate bounding box of all selected nodes in world space
    const bounds = this.calculateBoundingBox(nodeIds)
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
      name: "Group",
      parentId: commonParentId,
    })

    // Store the original bounding box dimensions
    groupNode.boundingBox = {
      width: bounds.width,
      height: bounds.height,
    }

    // Add the group node to the document
    this.document.addNode(groupNode)

    // Reparent all selected nodes to the new group
    // NOTE: We keep transforms in world space since the renderer doesn't support hierarchical transforms
    for (const node of nodes) {
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
    if (nodeIds.length < 2) return false

    // Check if all nodes exist
    const nodes: Node[] = []
    for (const id of nodeIds) {
      const node = this.document.getNode(id)
      if (!node) return false
      nodes.push(node)
    }

    // Check if all nodes have the same parent
    const parentIds = new Set(nodes.map((n) => n.parentId ?? "root"))
    return parentIds.size === 1
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
      const node = this.document.getNode(nodeId)
      if (!node) continue

      const shape = this.document.getShape(nodeId)
      if (!shape) continue

      const aabb = BoundingBoxService.getAABB(node, shape)
      aabbs.push(aabb)
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
}

// Made with Bob
