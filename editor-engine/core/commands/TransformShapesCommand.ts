import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import type { Shape } from "../model/Shape"

interface TransformData {
  nodeId: string
  oldNode: Node
  oldShape?: Shape
  newNode: Node
  newShape?: Shape
}

/**
 * TransformShapesCommand - Command for move, resize, and rotate operations
 * Supports undo/redo for shape transformations
 */
export class TransformShapesCommand extends Command {
  private transforms: TransformData[] = []
  private operationType: "move" | "resize" | "rotate"

  constructor(
    private editor: Editor,
    transforms: Array<{
      nodeId: string
      newNode: Node
      newShape?: Shape
    }>,
    operationType: "move" | "resize" | "rotate" = "move",
  ) {
    super()
    this.operationType = operationType

    // Store old and new states
    transforms.forEach(({ nodeId, newNode, newShape }) => {
      const oldNode = editor.document.getNode(nodeId)
      const oldShape = editor.document.getShape(nodeId)

      if (oldNode) {
        this.transforms.push({
          nodeId,
          oldNode: JSON.parse(JSON.stringify(oldNode)),
          oldShape: oldShape ? JSON.parse(JSON.stringify(oldShape)) : undefined,
          newNode,
          newShape,
        })
      }
    })
  }

  execute(): void {
    // Apply new transforms
    this.transforms.forEach(({ nodeId, newNode, newShape }) => {
      this.editor.document.updateNode(newNode)
      if (newShape) {
        this.editor.document.updateShape(newShape)
      }
    })

    // Re-render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    // Restore old transforms
    this.transforms.forEach(({ nodeId, oldNode, oldShape }) => {
      this.editor.document.updateNode(oldNode)
      if (oldShape) {
        this.editor.document.updateShape(oldShape)
      }
    })

    // Re-render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    const count = this.transforms.length
    return `${this.operationType.charAt(0).toUpperCase() + this.operationType.slice(1)} ${count} shape(s)`
  }

  canExecute(): boolean {
    return this.transforms.length > 0
  }

  canUndo(): boolean {
    return this.transforms.length > 0
  }
}

// Made with Bob
