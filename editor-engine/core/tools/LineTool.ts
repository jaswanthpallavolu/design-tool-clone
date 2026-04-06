import { Tool, ToolContext } from "./Tool"
import { LineShape } from "../model/Shape"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"

export class LineTool implements Tool {
  readonly id = "line"
  draft?: LineShape

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    // Top-left based: start at mouse position
    this.draft = {
      id: crypto.randomUUID(),
      kind: this.id,
      fillStyle: editor.state.toolOptions.fillColor,
      strokeStyle: editor.state.toolOptions.strokeColor,
      transform: { x: e.clientX, y: e.clientY, rotation: 0 },
      local: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      },
      lineWidth: 4,
    }
    editor.selection.setSingle(this.draft.id)
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEventData, { editor, renderOverlays }: ToolContext) {
    if (!this.draft) return
    // Top-left based: x2/y2 relative to transform.x/y
    this.draft.local.x2 = e.clientX - this.draft.transform.x
    this.draft.local.y2 = e.clientY - this.draft.transform.y
    editor.document.update(this.draft)
    editor.renderer?.renderShapes()

    SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays })
    renderOverlays()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext) {
    this.draft = undefined
    editor.setActiveTool("select")
  }
}

// Made with Bob
