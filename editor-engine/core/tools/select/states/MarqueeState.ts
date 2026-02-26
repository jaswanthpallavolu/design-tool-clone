import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { RectangleShape } from "@/editor-engine/core/model/Shape"
import { BoundingBoxService } from "@/editor-engine/core/services/BoundingBoxService"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class MarqueeState implements InteractionState {
  private draft?: RectangleShape
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.draft = {
      id: crypto.randomUUID(),
      kind: "rectangle",
      p1: { x: e.clientX, y: e.clientY },
      rotation: 0,
      width: 0,
      height: 0,
      fillStyle: "",
      strokeStyle: "",
    }
  }
  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    if (this.draft) {
      const width = e.clientX - this.draft.p1.x
      const height = e.clientY - this.draft.p1.y
      this.draft.width = width
      this.draft.height = height
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
                shape.p1.x,
                shape.p1.y,
                shape.p2.x,
                shape.p2.y,
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
