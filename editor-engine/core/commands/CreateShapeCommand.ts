import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import type { Shape } from "../model/Shape"

/**
 * CreateShapeCommand - Command to create a new shape
 * Supports undo/redo for shape creation
 */
export class CreateShapeCommand extends Command {
  private nodeId: string
  private node: Node
  private shape: Shape

  constructor(
    private editor: Editor,
    node: Node,
    shape: Shape,
  ) {
    super()
    this.nodeId = node.id
    this.node = node
    this.shape = shape
  }

  execute(): void {
    // Add node and shape to document
    this.editor.document.addNode(this.node)
    this.editor.document.addShape(this.shape)

    // Select the newly created shape
    this.editor.selection.setSingle(this.nodeId)

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    // Remove the shape and node
    this.editor.document.removeNode(this.nodeId)

    // Clear selection if this node was selected
    if (this.editor.selection.isSelected(this.nodeId)) {
      this.editor.selection.clear()
    }

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Create ${this.shape.type} shape`
  }

  canUndo(): boolean {
    return true
  }
}

// Made with Bob
