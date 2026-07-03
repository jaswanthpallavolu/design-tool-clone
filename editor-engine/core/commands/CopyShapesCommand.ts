import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import { isGroupNode } from "../model/Node"
import type { Shape } from "../model/Shape"

const COPY_OFFSET = 10

interface CopiedItem {
  node: Node
  shape?: Shape
}

/**
 * CopyShapesCommand - Duplicates the currently selected shapes/groups
 * in-place with a +10/+10 offset. Supports undo/redo.
 */
export class CopyShapesCommand extends Command {
  private sourceIds: string[]
  private copiedItems: CopiedItem[] = []
  /** Top-level IDs of the newly created copies (for selection + undo) */
  private copiedRootIds: string[] = []

  constructor(private editor: Editor) {
    super()
    this.sourceIds = [...this.editor.selection.getAll()]
  }

  /**
   * Walk the subtree rooted at `rootId` BFS-order and return deep clones of
   * every node+shape, remapping all IDs consistently.
   *
   * Returns { items, newRootId } where `newRootId` is the fresh ID for the root.
   */
  private cloneSubtree(
    rootId: string,
    newParentId: string | undefined,
  ): { items: CopiedItem[]; newRootId: string } {
    const idMap = new Map<string, string>() // old id → new id

    // First pass: assign new IDs for every node in the subtree
    const queue: string[] = [rootId]
    while (queue.length > 0) {
      const id = queue.shift()!
      idMap.set(id, crypto.randomUUID())
      const node = this.editor.document.getNode(id)
      if (node && isGroupNode(node)) {
        queue.push(...node.children)
      }
    }

    const newRootId = idMap.get(rootId)!

    // Second pass: clone nodes+shapes with remapped IDs, BFS order (parent-first)
    const items: CopiedItem[] = []
    const queue2: string[] = [rootId]

    while (queue2.length > 0) {
      const id = queue2.shift()!
      const node = this.editor.document.getNode(id)
      if (!node) continue

      const newId = idMap.get(id)!
      const isRoot = id === rootId

      // Clone the node, remap id / parentId.
      // children must start empty — addNode() builds it via parent.children.push()
      // when each child is inserted. Pre-populating it would cause duplicates.
      const clonedNode: Node = JSON.parse(JSON.stringify(node))
      clonedNode.id = newId
      clonedNode.parentId = isRoot ? newParentId : idMap.get(node.parentId!)
      clonedNode.children = []

      // Offset every node in the subtree — all transforms are absolute world
      // coordinates (children are not relative to their parent group), so every
      // node must be shifted by the same delta to keep the subtree intact.
      clonedNode.transform = {
        ...clonedNode.transform,
        x: clonedNode.transform.x + COPY_OFFSET,
        y: clonedNode.transform.y + COPY_OFFSET,
      }

      // Clone the shape if this node has one
      let clonedShape: Shape | undefined
      const shape = this.editor.document.getShape(id)
      if (shape) {
        clonedShape = JSON.parse(JSON.stringify(shape))
        clonedShape!.nodeId = newId
      }

      items.push({ node: clonedNode, shape: clonedShape })

      if (isGroupNode(node)) {
        queue2.push(...node.children)
      }
    }

    return { items, newRootId }
  }

  execute(): void {
    this.copiedItems = []
    this.copiedRootIds = []

    for (const id of this.sourceIds) {
      if (!this.editor.document.hasNode(id)) continue
      const sourceNode = this.editor.document.getNode(id)!
      const { items, newRootId } = this.cloneSubtree(id, sourceNode.parentId)
      this.copiedItems.push(...items)
      this.copiedRootIds.push(newRootId)
    }

    // Insert all cloned nodes+shapes
    for (const { node, shape } of this.copiedItems) {
      this.editor.document.addNode(node)
      if (shape) this.editor.document.addShape(shape)
    }

    // Select the new copies
    this.editor.selection.setMany(this.copiedRootIds)

    this.editor.renderer?.renderShapes()
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    // Remove in reverse BFS order (children before parents)
    for (let i = this.copiedItems.length - 1; i >= 0; i--) {
      const { node } = this.copiedItems[i]
      if (this.editor.document.hasNode(node.id)) {
        this.editor.document.removeNode(node.id)
      }
    }

    // Restore original selection
    this.editor.selection.setMany(this.sourceIds)

    this.editor.renderer?.renderShapes()
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Duplicate ${this.sourceIds.length} shape(s)`
  }

  canExecute(): boolean {
    return this.sourceIds.length > 0
  }

  canUndo(): boolean {
    return this.copiedRootIds.length > 0
  }
}

// Made with Bob
