import { Tool, ToolContext } from "./Tool"
import { Shape } from "../model/Shape"

export class LineTool implements Tool {
  readonly id = "line"
  draft?: Shape

  onPointerDown(e: PointerEvent, { editor }: ToolContext) {
    this.draft = {
      id: crypto.randomUUID(),
      kind: this.id,
      p1: { x: e.clientX, y: e.clientY },
      fillStyle: editor.state.toolOptions.fillColor,
      strokeStyle: editor.state.toolOptions.strokeColor,
      lineWidth: 4,
    }
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEvent, { editor }: ToolContext) {
    if (!this.draft) return
    this.draft.p2 = { x: e.clientX, y: e.clientY }
    editor.document.update(this.draft)
    editor.renderShapes()
  }

  onPointerUp(e: PointerEvent, { editor }: ToolContext) {
    this.draft = undefined
  }
}

// Made with Bob
