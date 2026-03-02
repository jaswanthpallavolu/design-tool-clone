import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { RectangleShape } from "@/editor-engine/core/model/Shape"
import { BoundingBoxService } from "@/editor-engine/core/services/BoundingBoxService"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class MarqueeState implements InteractionState {
  private draft?: RectangleShape
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.draft = {
      id: crypto.randomUUID(),
      kind: "rectangle",
      fillStyle: "",
      strokeStyle: "",
      transform: { x: this.mouseStart.x, y: this.mouseStart.y, rotation: 0 },
      local: { width: 0, height: 0 },
    }
  }
  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    if (this.draft) {
      if (!this.draft) return
      const minX = Math.min(this.mouseStart.x, e.clientX)
      const maxX = Math.max(this.mouseStart.x, e.clientX)
      const minY = Math.min(this.mouseStart.y, e.clientY)
      const maxY = Math.max(this.mouseStart.y, e.clientY)

      this.draft.transform.x = minX
      this.draft.transform.y = minY
      this.draft.local.width = maxX - minX
      this.draft.local.height = maxY - minY
      editor.state.marquee = BoundingBoxService.getAABB(this.draft)
    }
  }
  onPointerUp(e: PointerEventData, { editor }: ToolContext): void {
    if (editor.state.marquee) {
      const marquee = editor.state.marquee ?? {}
      editor.document.getAll().forEach((shape) => {
        const intersect =
          shape.kind === "line"
            ? BoundingBoxService.lineIntersectsAABB(
                shape.transform.x + shape.local.x1,
                shape.transform.y + shape.local.y1,
                shape.transform.x + shape.local.x2,
                shape.transform.y + shape.local.y2,
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
    SelectionBoundsHelper.updateSelectionBounds({ editor })
  }
}
