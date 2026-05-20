import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import type { Shape } from "../model/Shape"

/**
 * UpdateShapeCommand - Command to update an existing shape's geometry and transform
 * Supports undo/redo for shape modifications
 */
export class UpdateShapeCommand extends Command {
  private nodeId: string
  private oldNode: Node
  private oldShape: Shape
  private newNode: Node
  private newShape: Shape

  constructor(
    private editor: Editor,
    nodeId: string,
    newNode: Node,
    newShape: Shape,
  ) {
    super()
    this.nodeId = nodeId

    // Save current state for undo
    const currentNode = editor.document.getNode(nodeId)
    const currentShape = editor.document.getShape(nodeId)

    if (!currentNode || !currentShape) {
      throw new Error(`Shape with id ${nodeId} not found`)
    }

    // Deep copy current state
    this.oldNode = JSON.parse(JSON.stringify(currentNode))
    this.oldShape = JSON.parse(JSON.stringify(currentShape))

    // Store new state
    this.newNode = newNode
    this.newShape = newShape
  }

  execute(): void {
    // Update node and shape
    this.editor.document.updateNode(this.newNode)
    this.editor.document.updateShape(this.newShape)

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    // Restore old state
    this.editor.document.updateNode(this.oldNode)
    this.editor.document.updateShape(this.oldShape)

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Update ${this.newShape.type} shape`
  }

  canUndo(): boolean {
    return true
  }
}

// Made with Bob
