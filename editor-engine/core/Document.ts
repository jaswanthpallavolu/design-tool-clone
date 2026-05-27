import { Node, NodeType, isGroupNode } from "./model/Node"
import { Shape } from "./model/Shape"

export class Document {
  private readonly nodes = new Map<string, Node>()
  private readonly shapes = new Map<string, Shape>() // nodeId -> Shape

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
    return Array.from(this.nodes.values()).filter((n) => !n.parentId)
  }

  getChildren(parentId: string): Node[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.parentId === parentId,
    )
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
    }

    this.nodes.set(node.id, node)
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id)
    if (!node) return

    // Remove from parent's children array
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent && isGroupNode(parent)) {
        parent.children = parent.children.filter((childId) => childId !== id)
      }
    }

    // Remove associated shape if exists
    this.shapes.delete(id)

    // Remove node
    this.nodes.delete(id)

    // Recursively remove children
    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.removeNode(childId)
      }
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
  }

  /**
   * Move a node to a new parent (or root if parentId is undefined)
   */
  reparent(childId: string, newParentId: string | undefined): void {
    const child = this.nodes.get(childId)
    if (!child) {
      throw new Error(`Child node '${childId}' does not exist`)
    }

    const oldParentId = child.parentId

    // Remove from old parent's children array
    if (oldParentId) {
      const oldParent = this.nodes.get(oldParentId)
      if (oldParent && isGroupNode(oldParent)) {
        oldParent.children = oldParent.children.filter((id) => id !== childId)
      }
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
    }
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
