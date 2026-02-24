import { Tool, ToolContext } from "./Tool"
import { LineShape } from "../model/Shape"
import type { PointerEventData } from "../types/InputTypes"

export class LineTool implements Tool {
  readonly id = "line"
  draft?: LineShape

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.draft = {
      id: crypto.randomUUID(),
      kind: this.id,
      p1: { x: e.clientX, y: e.clientY },
      p2: { x: 0, y: 0 },
      fillStyle: editor.state.toolOptions.fillColor,
      strokeStyle: editor.state.toolOptions.strokeColor,
      lineWidth: 4,
    }
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEventData, { editor }: ToolContext) {
    if (!this.draft) return
    this.draft.p2 = { x: e.clientX, y: e.clientY }
    editor.document.update(this.draft)
    editor.renderer?.renderShapes()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext) {
    this.draft = undefined
  }
}

// Made with Bob
