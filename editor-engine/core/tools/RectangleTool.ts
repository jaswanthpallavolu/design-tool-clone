import { Tool, ToolContext } from "./Tool"
import { RectangleShape, ShapeType } from "../model/Shape"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"

export class RectangleTool implements Tool {
  readonly id = "rectangle"
  draft?: RectangleShape
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }
  hasDragged = false

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.hasDragged = false
    this.draft = {
      id: crypto.randomUUID(),
      type: ShapeType.RECTANGLE,
      style: {
        fillColor: editor.state.toolOptions.fillColor,
        strokeColor: editor.state.toolOptions.strokeColor,
      },
      geometry: {
        x: this.mouseStart.x,
        y: this.mouseStart.y,
        rotation: 0,
        width: 0,
        height: 0,
      },
    }
    editor.selection.setSingle(this.draft.id)
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEventData, { editor, renderOverlays }: ToolContext) {
    if (!this.draft) return
    const minX = Math.min(this.mouseStart.x, e.clientX)
    const maxX = Math.max(this.mouseStart.x, e.clientX)
    const minY = Math.min(this.mouseStart.y, e.clientY)
    const maxY = Math.max(this.mouseStart.y, e.clientY)
    const width = maxX - minX
    const height = maxY - minY

    if (width === 0 && height === 0) return

    this.hasDragged = true

    // Top-left based: geometry.x/y is the top-left corner
    this.draft.geometry.x = minX
    this.draft.geometry.y = minY
    this.draft.geometry.width = width
    this.draft.geometry.height = height
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
