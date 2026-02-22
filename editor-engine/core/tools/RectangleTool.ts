import { Tool, ToolContext } from "./Tool"
import { Shape } from "../model/Shape"

export class RectangleTool implements Tool {
  readonly id = "rectangle"
  draft?: Shape

  onPointerDown(e: PointerEvent, { editor }: ToolContext) {
    this.draft = {
      id: crypto.randomUUID(),
      kind: this.id,
      p1: { x: e.clientX, y: e.clientY },
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
    editor.renderShapes()
  }

  onPointerUp(e: PointerEvent, { editor }: ToolContext) {
    this.draft = undefined
  }
}
