import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { RectangleShape, ShapeType } from "@/editor-engine/core/model/Shape"
import { BoundingBoxService } from "@/editor-engine/core/services/BoundingBoxService"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class MarqueeState implements InteractionState {
  private draft?: RectangleShape
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.draft = {
      id: crypto.randomUUID(),
      type: ShapeType.RECTANGLE,
      style: {
        fillColor: "",
        strokeColor: "",
      },
      geometry: {
        x: this.mouseStart.x,
        y: this.mouseStart.y,
        rotation: 0,
        width: 0,
        height: 0,
      },
    }
  }
  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    if (this.draft) {
      if (!this.draft) return
      const minX = Math.min(this.mouseStart.x, e.clientX)
      const maxX = Math.max(this.mouseStart.x, e.clientX)
      const minY = Math.min(this.mouseStart.y, e.clientY)
      const maxY = Math.max(this.mouseStart.y, e.clientY)

      this.draft.geometry.x = minX
      this.draft.geometry.y = minY
      this.draft.geometry.width = maxX - minX
      this.draft.geometry.height = maxY - minY
      editor.state.marquee = BoundingBoxService.getAABB(this.draft)
    }
  }
  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    if (editor.state.marquee) {
      const marquee = editor.state.marquee ?? {}
      editor.document.getAll().forEach((shape) => {
        const intersect =
          shape.type === "LINE"
            ? BoundingBoxService.lineIntersectsAABB(
                shape.geometry.x + shape.geometry.x1,
                shape.geometry.y + shape.geometry.y1,
                shape.geometry.x + shape.geometry.x2,
                shape.geometry.y + shape.geometry.y2,
                marquee,
              )
            : BoundingBoxService.aabbIntersects(
                marquee,
                BoundingBoxService.getAABB(shape),
              )
        if (intersect) {
          editor.selection.select(shape.id)
        }
      })
    }
    this.draft = undefined
    editor.state.marquee = undefined
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }
}
