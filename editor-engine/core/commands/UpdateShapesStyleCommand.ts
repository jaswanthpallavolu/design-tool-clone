import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Shape, ShapeStyle } from "../model/Shape"

/**
 * UpdateShapesStyleCommand - Command to update styles of multiple shapes
 * Supports undo/redo for style modifications
 */
export class UpdateShapesStyleCommand extends Command {
  private nodeIds: string[]
  private oldStyles: Map<string, ShapeStyle>
  private newStyle: Partial<ShapeStyle>

  constructor(
    private editor: Editor,
    nodeIds: string[],
    newStyle: Partial<ShapeStyle>,
  ) {
    super()
    this.nodeIds = nodeIds
    this.newStyle = newStyle

    // Save current styles for undo
    this.oldStyles = new Map()
    nodeIds.forEach((nodeId) => {
      const shape = editor.document.getShape(nodeId)
      if (shape) {
        this.oldStyles.set(nodeId, { ...shape.style })
      }
    })
  }

  execute(): void {
    this.nodeIds.forEach((nodeId) => {
      const shape = this.editor.document.getShape(nodeId)
      if (shape) {
        // Update style properties
        Object.assign(shape.style, this.newStyle)
        this.editor.document.updateShape(shape)
      }
    })

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    this.nodeIds.forEach((nodeId) => {
      const shape = this.editor.document.getShape(nodeId)
      const oldStyle = this.oldStyles.get(nodeId)
      if (shape && oldStyle) {
        // Restore old style
        shape.style = oldStyle
        this.editor.document.updateShape(shape)
      }
    })

    // Render
    this.editor.renderer?.renderShapes()

    // Emit event
    this.editor.events.emit("document:modified")
  }

  describe(): string {
    const styleChanges = Object.entries(this.newStyle)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ")
    return `Update style of ${this.nodeIds.length} shape(s): ${styleChanges}`
  }

  canUndo(): boolean {
    return true
  }
}

// Made with Bob
