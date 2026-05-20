import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
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
  private deletedItems: DeletedItem[] = []
  private deletedIds: string[]

  constructor(
    private editor: Editor,
    nodeIds: string[],
  ) {
    super()
    this.deletedIds = [...nodeIds]
  }

  execute(): void {
    // Store deleted items for undo
    this.deletedItems = []

    this.deletedIds.forEach((id) => {
      const node = this.editor.document.getNode(id)
      const shape = this.editor.document.getShape(id)

      if (node) {
        this.deletedItems.push({
          node: JSON.parse(JSON.stringify(node)),
          shape: shape ? JSON.parse(JSON.stringify(shape)) : undefined,
        })

        // Remove from document
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
    // Restore deleted items
    this.deletedItems.forEach(({ node, shape }) => {
      this.editor.document.addNode(node)
      if (shape) {
        this.editor.document.addShape(shape)
      }
    })

    // Restore selection
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
