import { Tool, ToolContext } from "./Tool"
import { EllipseShape } from "../model/Shape"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"

export class EllipseTool implements Tool {
  readonly id = "ellipse"
  draft?: EllipseShape
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.draft = {
      id: crypto.randomUUID(),
      kind: "ellipse",
      fillStyle: editor.state.toolOptions.fillColor,
      strokeStyle: editor.state.toolOptions.strokeColor,
      transform: { x: this.mouseStart.x, y: this.mouseStart.y, rotation: 0 },
      local: { width: 0, height: 0 },
    }
    editor.selection.setSingle(this.draft.id)
    editor.document.add(this.draft)
  }

  onPointerMove(e: PointerEventData, { editor, renderOverlays }: ToolContext) {
    if (!this.draft) return
    const minX = Math.min(this.mouseStart.x, e.clientX)
    const minY = Math.min(this.mouseStart.y, e.clientY)
    const maxX = Math.max(this.mouseStart.x, e.clientX)
    const maxY = Math.max(this.mouseStart.y, e.clientY)

    // Top-left based: transform.x/y is the top-left corner
    this.draft.transform.x = minX
    this.draft.transform.y = minY
    this.draft.local.width = maxX - minX
    this.draft.local.height = maxY - minY
    editor.document.update(this.draft)
    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays })
    renderOverlays()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext) {
    this.draft = undefined
  }
}

// Made with Bob
