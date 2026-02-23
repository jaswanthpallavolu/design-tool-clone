import { Tool, ToolContext } from "./Tool"
import { EllipseShape } from "../model/Shape"

export class EllipseTool implements Tool {
  readonly id = "ellipse"
  draft?: EllipseShape

  onPointerDown(e: PointerEvent, { editor }: ToolContext) {
    this.draft = {
      id: crypto.randomUUID(),
      kind: this.id,
      p1: { x: e.clientX, y: e.clientY },
      width: 0,
      height: 0,
      rotation: 0,
      fillStyle: editor.state.toolOptions.fillColor,
      strokeStyle: editor.state.toolOptions.strokeColor,
    }
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEvent, { editor }: ToolContext) {
    if (!this.draft) return
    const width = e.clientX - this.draft.p1.x
    const height = e.clientY - this.draft.p1.y
    this.draft.width = width
    this.draft.height = height
    editor.document.update(this.draft)
    editor.renderer?.renderShapes()
  }

  onPointerUp(e: PointerEvent, { editor }: ToolContext) {
    this.draft = undefined
  }
}

// Made with Bob
