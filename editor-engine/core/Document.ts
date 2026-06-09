import { Node, NodeType, isGroupNode } from "./model/Node"
import { Shape } from "./model/Shape"

export class Document {
  private readonly nodes = new Map<string, Node>()
  private readonly shapes = new Map<string, Shape>() // nodeId -> Shape
  private readonly rootNodeIds = new Set<string>() // Cache for root nodes

  // ---------------------------------------------
  // Node Queries
  // ---------------------------------------------

  getNode(id: string): Node | undefined {
    return this.nodes.get(id)
  }

  getAllNodes(): readonly Node[] {
    return Array.from(this.nodes.values())
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  getRootNodes(): Node[] {
    return Array.from(this.rootNodeIds)
      .map((id) => this.nodes.get(id))
      .filter(Boolean) as Node[]
  }

  getChildren(parentId: string): Node[] {
    const parent = this.nodes.get(parentId)
    if (!parent || !isGroupNode(parent)) return []
    return parent.children
      .map((id) => this.nodes.get(id))
      .filter(Boolean) as Node[]
  }

  getParent(childId: string): Node | undefined {
    const child = this.nodes.get(childId)
    return child?.parentId ? this.nodes.get(child.parentId) : undefined
  }

  /**
   * Get the top-level parent (root-level node) for a given node
   * If the node has no parent, returns the node itself
   */
  getTopLevelParent(nodeId: string): Node | undefined {
    let current = this.nodes.get(nodeId)
    if (!current) return undefined

    while (current.parentId) {
      const parent = this.nodes.get(current.parentId)
      if (!parent) break
      current = parent
    }

    return current
  }

  // ---------------------------------------------
  // Shape Queries
  // ---------------------------------------------

  getShape(nodeId: string): Shape | undefined {
    return this.shapes.get(nodeId)
  }

  getAllShapes(): readonly Shape[] {
    return Array.from(this.shapes.values())
  }

  hasShape(nodeId: string): boolean {
    return this.shapes.has(nodeId)
  }

  getShapesMap(): Map<string, Shape> {
    return this.shapes
  }

  // ---------------------------------------------
  // Combined Queries (for convenience)
  // ---------------------------------------------

  /**
   * Get all nodes that are shapes (not groups)
   * Returns array of [node, shape] tuples
   */
  getShapeNodes(): Array<[Node, Shape]> {
    const result: Array<[Node, Shape]> = []
    for (const node of this.nodes.values()) {
      if (node.type === NodeType.SHAPE) {
        const shape = this.shapes.get(node.id)
        if (shape) {
          result.push([node, shape])
        }
      }
    }
    return result
  }

  // ---------------------------------------------
  // Node Commands
  // ---------------------------------------------

  addNode(node: Node): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id '${node.id}' already exists`)
    }

    // If node has a parent, add to parent's children
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (!parent) {
        throw new Error(`Parent node '${node.parentId}' does not exist`)
      }
      if (!isGroupNode(parent)) {
        throw new Error(`Parent node '${node.parentId}' is not a group`)
      }
      if (!parent.children.includes(node.id)) {
        parent.children.push(node.id)
      }
    } else {
      // Track root nodes
      this.rootNodeIds.add(node.id)
    }

    this.nodes.set(node.id, node)
  }

  removeNode(id: string): void {
    // Use iterative approach to avoid stack overflow on deep trees
    const toRemove = [id]

    while (toRemove.length > 0) {
      const currentId = toRemove.pop()!
      const node = this.nodes.get(currentId)
      if (!node) continue

      // Add children to removal queue
      if (isGroupNode(node)) {
        toRemove.push(...node.children)
      }

      // Remove from parent's children array
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId)
        if (parent && isGroupNode(parent)) {
          parent.children = parent.children.filter((cid) => cid !== currentId)
        }
      } else {
        // Remove from root nodes cache
        this.rootNodeIds.delete(currentId)
      }

      // Remove associated shape if exists
      this.shapes.delete(currentId)

      // Remove node
      this.nodes.delete(currentId)
    }
  }

  updateNode(node: Node): void {
    if (!this.nodes.has(node.id)) {
      throw new Error(`Node with id '${node.id}' does not exist`)
    }

    this.nodes.set(node.id, node)
  }

  /**
   * Set the z-order of a node by moving it to a specific index
   * Higher index = higher z-order (drawn on top)
   * Also updates the parent's children array to reflect the new order
   */
  setNodeZOrder(nodeId: string, targetIndex: number): void {
    const node = this.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const nodesArray = Array.from(this.nodes.entries())
    const currentIndex = nodesArray.findIndex(([id]) => id === nodeId)

    if (currentIndex === -1) return

    // Remove from current position
    const [entry] = nodesArray.splice(currentIndex, 1)

    // Insert at target position
    const clampedIndex = Math.max(0, Math.min(targetIndex, nodesArray.length))
    nodesArray.splice(clampedIndex, 0, entry)

    // Rebuild Map to maintain new order
    this.nodes.clear()
    for (const [id, node] of nodesArray) {
      this.nodes.set(id, node)
    }

    // Update parent's children array to match new sibling order
    this.updateParentChildrenOrder(nodeId)
  }

  /**
   * Update the parent's children array to match the current Map order
   */
  private updateParentChildrenOrder(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) return

    // Get all siblings (including this node)
    const siblings = node.parentId
      ? this.getChildren(node.parentId)
      : this.getRootNodes()

    // Get their IDs in current Map order
    const allNodes = Array.from(this.nodes.values())
    const orderedSiblingIds = allNodes
      .filter((n) => siblings.some((s) => s.id === n.id))
      .map((n) => n.id)

    // Update parent's children array or root cache
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent && isGroupNode(parent)) {
        parent.children = orderedSiblingIds
      }
    } else {
      // Update root nodes cache
      this.rootNodeIds.clear()
      orderedSiblingIds.forEach((id) => this.rootNodeIds.add(id))
    }
  }

  /**
   * Bring node to front (highest z-order among siblings)
   * Higher index = drawn later = appears on top
   */
  bringToFront(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    // Find highest z-index among siblings
    const allNodes = Array.from(this.nodes.values())
    const currentIndex = allNodes.findIndex((n) => n.id === nodeId)
    const maxSiblingIndex = Math.max(
      ...siblings.map((s) => allNodes.findIndex((n) => n.id === s.id)),
    )

    // Check if already at front
    if (currentIndex > maxSiblingIndex) {
      return // Already at the front, no operation needed
    }

    // Move to position after the highest sibling (on top)
    this.setNodeZOrder(nodeId, maxSiblingIndex + 1)
  }

  /**
   * Send node to back (lowest z-order among siblings)
   * Lower index = drawn first = appears at bottom
   */
  sendToBack(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    // Find lowest z-index among siblings
    const allNodes = Array.from(this.nodes.values())
    const currentIndex = allNodes.findIndex((n) => n.id === nodeId)
    const minSiblingIndex = Math.min(
      ...siblings.map((s) => allNodes.findIndex((n) => n.id === s.id)),
    )

    // Check if already at back
    if (currentIndex < minSiblingIndex) {
      return // Already at the back, no operation needed
    }

    // Move to position of the lowest sibling (at bottom)
    this.setNodeZOrder(nodeId, minSiblingIndex)
  }

  /**
   * Move node one step forward in z-order (among siblings)
   */
  bringForward(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const allNodes = Array.from(this.nodes.values())
    const currentIndex = allNodes.findIndex((n) => n.id === nodeId)

    // Find next sibling with higher z-index
    const siblingIndices = siblings
      .map((s) => allNodes.findIndex((n) => n.id === s.id))
      .filter((idx) => idx > currentIndex)
      .sort((a, b) => a - b)

    console.log("bringForward DEBUG:", {
      nodeId,
      nodeName: node.name,
      currentIndex,
      allNodesCount: allNodes.length,
      siblingsCount: siblings.length,
      siblingNames: siblings.map((s) => s.name),
      siblingIndices,
      nextSiblingIndex: siblingIndices[0],
      nextSiblingName:
        siblingIndices[0] !== undefined
          ? allNodes[siblingIndices[0]]?.name
          : "none",
    })

    if (siblingIndices.length === 0) return // Already at front

    // Get the immediate next sibling index
    const nextSiblingIndex = siblingIndices[0]

    // Swap: move current node to just after the next sibling
    // Since setNodeZOrder removes first, the next sibling shifts down by 1
    // So we target the next sibling's current position
    this.setNodeZOrder(nodeId, nextSiblingIndex)
  }

  /**
   * Move node one step backward in z-order (among siblings)
   * Lower index = drawn first = appears behind
   */
  sendBackward(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const allNodes = Array.from(this.nodes.values())
    const currentIndex = allNodes.findIndex((n) => n.id === nodeId)

    // Find previous sibling with lower z-index (drawn before current)
    const siblingIndices = siblings
      .map((s) => allNodes.findIndex((n) => n.id === s.id))
      .filter((idx) => idx < currentIndex)
      .sort((a, b) => b - a)

    if (siblingIndices.length === 0) return // Already at back

    // Get the immediate previous sibling index
    const prevSiblingIndex = siblingIndices[0]

    // Swap: move current node to the previous sibling's position
    // Since setNodeZOrder removes first, we use the index directly
    this.setNodeZOrder(nodeId, prevSiblingIndex)
  }

  /**
   * Get all sibling nodes (nodes with the same parent)
   */
  private getSiblings(nodeId: string): Node[] {
    const node = this.nodes.get(nodeId)
    if (!node) return []

    if (node.parentId) {
      return this.getChildren(node.parentId).filter((n) => n.id !== nodeId)
    } else {
      return this.getRootNodes().filter((n) => n.id !== nodeId)
    }
  }

  /**
   * Move a node to a new parent (or root if parentId is undefined)
   */
  reparent(childId: string, newParentId: string | undefined): void {
    const child = this.nodes.get(childId)
    if (!child) {
      throw new Error(`Child node '${childId}' does not exist`)
    }

    // Prevent cycles
    if (newParentId && this.wouldCreateCycle(childId, newParentId)) {
      throw new Error("Cannot reparent: would create cycle")
    }

    const oldParentId = child.parentId

    // Remove from old parent's children array
    if (oldParentId) {
      const oldParent = this.nodes.get(oldParentId)
      if (oldParent && isGroupNode(oldParent)) {
        oldParent.children = oldParent.children.filter((id) => id !== childId)
      }
    } else {
      // Remove from root nodes cache
      this.rootNodeIds.delete(childId)
    }

    // Update child's parent reference
    child.parentId = newParentId

    // Add to new parent's children array
    if (newParentId) {
      const newParent = this.nodes.get(newParentId)
      if (!newParent) {
        throw new Error(`New parent node '${newParentId}' does not exist`)
      }
      if (!isGroupNode(newParent)) {
        throw new Error(`New parent node '${newParentId}' is not a group`)
      }
      if (!newParent.children.includes(childId)) {
        newParent.children.push(childId)
      }
    } else {
      // Add to root nodes cache
      this.rootNodeIds.add(childId)
    }
  }

  /**
   * Check if reparenting would create a cycle in the tree
   */
  private wouldCreateCycle(childId: string, newParentId: string): boolean {
    let current: string | undefined = newParentId
    while (current) {
      if (current === childId) return true
      const node = this.nodes.get(current)
      current = node?.parentId
    }
    return false
  }

  // ---------------------------------------------
  // Shape Commands
  // ---------------------------------------------

  addShape(shape: Shape): void {
    if (this.shapes.has(shape.nodeId)) {
      throw new Error(`Shape for node '${shape.nodeId}' already exists`)
    }

    // Verify node exists and is a shape node
    const node = this.nodes.get(shape.nodeId)
    if (!node) {
      throw new Error(`Node '${shape.nodeId}' does not exist`)
    }
    if (node.type !== NodeType.SHAPE) {
      throw new Error(`Node '${shape.nodeId}' is not a shape node`)
    }

    this.shapes.set(shape.nodeId, shape)
  }

  removeShape(nodeId: string): void {
    this.shapes.delete(nodeId)
  }

  updateShape(shape: Shape): void {
    if (!this.shapes.has(shape.nodeId)) {
      throw new Error(`Shape for node '${shape.nodeId}' does not exist`)
    }

    this.shapes.set(shape.nodeId, shape)
  }

  // ---------------------------------------------
  // Utility
  // ---------------------------------------------

  clear(): void {
    this.nodes.clear()
    this.shapes.clear()
    this.rootNodeIds.clear()
  }

  // ---------------------------------------------
  // Debug
  // ---------------------------------------------

  /**
   * Print document tree in depth-first order
   * Last drawn shape appears first (reverse order)
   */

  debugTree(): void {
    console.log("Document Tree:")
    const roots = this.getRootNodes()

    for (const root of roots) {
      this.printNode(root.id, 0)
    }
  }

  private printNode(nodeId: string, depth: number): void {
    const node = this.nodes.get(nodeId)
    if (!node) return

    const indent = "  ".repeat(depth)
    const type = node.type === NodeType.GROUP ? "Group" : "Shape"
    console.log(`${indent}${type} ${node.name} (${node.id})`)

    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.printNode(childId, depth + 1)
      }
    }
  }
}
