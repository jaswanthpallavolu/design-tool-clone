import { Tool, ToolContext } from "./Tool"
import { LineShape, ShapeType } from "../model/Shape"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"

export class LineTool implements Tool {
  readonly id = "line"
  draft?: LineShape
  hasDragged = false

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.hasDragged = false
    // Top-left based: start at mouse position
    this.draft = {
      id: crypto.randomUUID(),
      type: ShapeType.LINE,
      style: {
        fillColor: editor.state.toolOptions.fillColor,
        strokeColor: editor.state.toolOptions.strokeColor,
      },
      geometry: {
        x: e.clientX,
        y: e.clientY,
        rotation: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        lineWidth: 4,
      },
    }
    editor.selection.setSingle(this.draft.id)
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEventData, { editor, renderOverlays }: ToolContext) {
    if (!this.draft) return
    const nextX2 = e.clientX - this.draft.geometry.x
    const nextY2 = e.clientY - this.draft.geometry.y

    if (nextX2 === 0 && nextY2 === 0) return

    this.hasDragged = true

    // Top-left based: x2/y2 relative to geometry.x/y
    this.draft.geometry.x2 = nextX2
    this.draft.geometry.y2 = nextY2
    editor.document.update(this.draft)
    editor.renderer?.renderShapes()

    SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays })
    renderOverlays()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext) {
    if (this.draft) {
      if (!this.hasDragged) {
        editor.document.remove(this.draft.id)
        editor.selection.clear()
        editor.renderer?.renderShapes()
        this.draft = undefined
        this.hasDragged = false
        return
      }
      this.draft = undefined
      this.hasDragged = false
      editor.setActiveTool("select")
    }
  }
}

// Made with Bob
