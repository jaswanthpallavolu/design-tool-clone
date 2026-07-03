import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import { isGroupNode } from "../model/Node"
import type { Shape } from "../model/Shape"

interface DeletedItem {
  node: Node
  shape?: Shape
}

/**
 * DeleteShapesCommand - Command to delete selected shapes
 * Supports undo/redo for shape deletion
 */
export class DeleteShapesCommand extends Command {
  // Flat list in parent-first BFS order — safe to re-add in this order on undo
  private deletedItems: DeletedItem[] = []
  private deletedIds: string[]

  constructor(
    private editor: Editor,
    nodeIds: string[],
  ) {
    super()
    this.deletedIds = [...nodeIds]
  }

  /**
   * Collect node + shape for `id` and all its descendants, breadth-first.
   * Parent-first order means addNode() on undo won't hit "parent not found".
   */
  private collectSubtree(rootId: string): DeletedItem[] {
    const items: DeletedItem[] = []
    const queue: string[] = [rootId]

    while (queue.length > 0) {
      const id = queue.shift()!
      const node = this.editor.document.getNode(id)
      if (!node) continue

      const shape = this.editor.document.getShape(id)
      items.push({
        node: JSON.parse(JSON.stringify(node)),
        shape: shape ? JSON.parse(JSON.stringify(shape)) : undefined,
      })

      if (isGroupNode(node)) {
        queue.push(...node.children)
      }
    }

    return items
  }

  execute(): void {
    // Snapshot full subtrees before any removal so parent nodes still exist
    // while we walk their children.
    this.deletedItems = []
    const seen = new Set<string>()

    this.deletedIds.forEach((id) => {
      if (!seen.has(id) && this.editor.document.hasNode(id)) {
        const subtree = this.collectSubtree(id)
        subtree.forEach((item) => seen.add(item.node.id))
        this.deletedItems.push(...subtree)
      }
    })

    // Now remove the top-level nodes (removeNode handles descendants)
    this.deletedIds.forEach((id) => {
      if (this.editor.document.hasNode(id)) {
        this.editor.document.removeNode(id)
      }
    })

    // Clear selection and transient state
    this.editor.selection.clear()
    this.editor.state.clearTransient()

    // Re-render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    // deletedItems is in parent-first BFS order — safe to re-add sequentially
    this.deletedItems.forEach(({ node, shape }) => {
      this.editor.document.addNode(node)
      if (shape) {
        this.editor.document.addShape(shape)
      }
    })

    // Restore selection to the original top-level nodes
    this.editor.selection.setMany(this.deletedIds)

    // Re-render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Delete ${this.deletedIds.length} shape(s)`
  }

  canExecute(): boolean {
    return this.deletedIds.length > 0
  }

  canUndo(): boolean {
    return this.deletedItems.length > 0
  }
}

// Made with Bob
