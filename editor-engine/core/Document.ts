import { Node, NodeType, isGroupNode } from "./model/Node"
import { Shape } from "./model/Shape"

export class Document {
  private readonly nodes = new Map<string, Node>()
  private readonly shapes = new Map<string, Shape>()
  private readonly rootNodeIds = new Set<string>()
  private readonly zOrder: string[] = []

  // Queries (Read Operations)

  getNode(id: string): Node | undefined {
    return this.nodes.get(id)
  }

  getAllNodes(): readonly Node[] {
    return this.zOrder.map((id) => this.nodes.get(id)).filter(Boolean) as Node[]
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  /**
   * Get the z-order array (node IDs in drawing order)
   * Lower index = drawn first (behind), higher index = drawn last (on top)
   */
  getZOrder(): readonly string[] {
    return this.zOrder
  }

  /**
   * Get the z-index of a node in the z-order array
   * Returns -1 if node is not found
   */
  getNodeZIndex(nodeId: string): number {
    return this.zOrder.indexOf(nodeId)
  }

  getRootNodes(): Node[] {
    return this.zOrder
      .filter((id) => this.rootNodeIds.has(id))
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

  /**
   * Get all nodes that are shapes (not groups)
   * Returns array of [node, shape] tuples
   */
  getShapeNodes(): Array<[Node, Shape]> {
    const result: Array<[Node, Shape]> = []
    const processedNodes = new Set<string>()

    const collectShapes = (nodeId: string): void => {
      const node = this.nodes.get(nodeId)
      if (!node || processedNodes.has(nodeId)) return

      if (node.type === NodeType.SHAPE) {
        const shape = this.shapes.get(nodeId)
        if (shape) {
          result.push([node, shape])
          processedNodes.add(nodeId)
        }
      } else if (isGroupNode(node)) {
        processedNodes.add(nodeId)
        const descendants = this.getNodeAndDescendants(nodeId)
          .filter((id) => id !== nodeId)
          .sort((a, b) => this.zOrder.indexOf(a) - this.zOrder.indexOf(b))

        for (const descendantId of descendants) {
          collectShapes(descendantId)
        }
      }
    }

    for (const nodeId of this.zOrder) {
      if (processedNodes.has(nodeId)) continue

      const node = this.nodes.get(nodeId)
      if (!node) continue

      if (!node.parentId) {
        collectShapes(nodeId)
      }
    }

    return result
  }

  // Commands (Write Operations)

  addNode(node: Node): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id '${node.id}' already exists`)
    }

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (!parent) {
        throw new Error(`Parent node '${node.parentId}' does not exist`)
      }
      if (!isGroupNode(parent)) {
        throw new Error(`Parent node '${node.parentId}' is not a group`)
      }
      parent.children.push(node.id)

      if (parent.children.length > 1) {
        const lastChildId = parent.children[parent.children.length - 2]
        const lastChildZIndex = this.zOrder.indexOf(lastChildId)

        if (lastChildZIndex !== -1) {
          this.zOrder.splice(lastChildZIndex + 1, 0, node.id)
        } else {
          this.zOrder.push(node.id)
        }
      } else {
        const parentZIndex = this.zOrder.indexOf(node.parentId)
        if (parentZIndex !== -1) {
          this.zOrder.splice(parentZIndex + 1, 0, node.id)
        } else {
          this.zOrder.push(node.id)
        }
      }
    } else {
      this.rootNodeIds.add(node.id)
      this.zOrder.push(node.id)
    }

    this.nodes.set(node.id, node)
  }

  removeNode(id: string): void {
    const toRemove = [id]

    while (toRemove.length > 0) {
      const currentId = toRemove.pop()!
      const node = this.nodes.get(currentId)
      if (!node) continue

      if (isGroupNode(node)) {
        toRemove.push(...node.children)
      }

      if (node.parentId) {
        const parent = this.nodes.get(node.parentId)
        if (parent && isGroupNode(parent)) {
          parent.children = parent.children.filter((cid) => cid !== currentId)
        }
      } else {
        this.rootNodeIds.delete(currentId)
      }

      this.shapes.delete(currentId)

      const zIndex = this.zOrder.indexOf(currentId)
      this.zOrder.splice(zIndex, 1)

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
   * Set the z-order position of a node
   * Automatically maintains parent-children order invariant
   * @param nodeId - The node to reposition
   * @param targetIndex - The target index in the z-order array
   */
  setNodeZOrder(nodeId: string, targetIndex: number): void {
    const currentIndex = this.zOrder.indexOf(nodeId)
    if (currentIndex === -1) return

    this.zOrder.splice(currentIndex, 1)

    const clampedIndex = Math.max(0, Math.min(targetIndex, this.zOrder.length))
    this.zOrder.splice(clampedIndex, 0, nodeId)

    // Automatically maintain invariant: parent's children array matches z-order
    this.maintainParentChildrenInvariant(nodeId)
  }

  /**
   * Replace the entire z-order array with a new order
   * Automatically maintains parent-children order invariants for all affected nodes
   * @param newZOrder - The new z-order array
   */
  replaceZOrder(newZOrder: string[]): void {
    this.zOrder.length = 0
    this.zOrder.push(...newZOrder)

    // Maintain invariants for all group nodes
    this.maintainAllParentChildrenInvariants()
  }

  /**
   * Maintain the invariant that a parent's children array matches z-order
   * @param nodeId - The node whose parent's children array should be synced
   */
  private maintainParentChildrenInvariant(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node?.parentId) return

    const parent = this.nodes.get(node.parentId)
    if (!parent || !isGroupNode(parent)) return

    // Reorder parent's children to match z-order
    parent.children.sort(
      (a, b) => this.zOrder.indexOf(a) - this.zOrder.indexOf(b),
    )
  }

  /**
   * Maintain invariants for all group nodes in the document
   * Called after bulk z-order changes
   */
  private maintainAllParentChildrenInvariants(): void {
    for (const node of this.nodes.values()) {
      if (isGroupNode(node)) {
        // Reorder this group's children to match z-order
        node.children.sort(
          (a, b) => this.zOrder.indexOf(a) - this.zOrder.indexOf(b),
        )
      }
    }
  }

  /**
   * Get a node and all its descendants in z-order
   * Used internally for tree operations
   */
  private getNodeAndDescendants(nodeId: string): string[] {
    const result: string[] = []
    const node = this.nodes.get(nodeId)
    if (!node) return result

    result.push(nodeId)

    if (isGroupNode(node)) {
      for (const childId of node.children) {
        result.push(...this.getNodeAndDescendants(childId))
      }
    }

    return result
  }

  /**
   * Move a node to a new parent (or root if parentId is undefined)
   */
  reparent(childId: string, newParentId: string | undefined): void {
    const child = this.nodes.get(childId)
    if (!child) {
      throw new Error(`Child node '${childId}' does not exist`)
    }

    if (newParentId && this.wouldCreateCycle(childId, newParentId)) {
      throw new Error("Cannot reparent: would create cycle")
    }

    const oldParentId = child.parentId

    if (oldParentId) {
      const oldParent = this.nodes.get(oldParentId)
      if (oldParent && isGroupNode(oldParent)) {
        oldParent.children = oldParent.children.filter((id) => id !== childId)
      }
    } else {
      this.rootNodeIds.delete(childId)
    }

    child.parentId = newParentId

    if (newParentId) {
      const newParent = this.nodes.get(newParentId)
      if (!newParent) {
        throw new Error(`New parent node '${newParentId}' does not exist`)
      }
      if (!isGroupNode(newParent)) {
        throw new Error(`New parent node '${newParentId}' is not a group`)
      }
      newParent.children.push(childId)
    } else {
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

  // Shape Commands

  addShape(shape: Shape): void {
    if (this.shapes.has(shape.nodeId)) {
      throw new Error(`Shape for node '${shape.nodeId}' already exists`)
    }

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

  // Utility

  clear(): void {
    this.nodes.clear()
    this.shapes.clear()
    this.rootNodeIds.clear()
    this.zOrder.length = 0
  }

  // Debug

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
