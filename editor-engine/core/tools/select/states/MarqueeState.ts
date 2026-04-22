import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import {
  BoundingBoxService,
  AABB,
} from "@/editor-engine/core/services/BoundingBoxService"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class MarqueeState implements InteractionState {
  private marqueeBox?: AABB
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.mouseStart = { x: e.clientX, y: e.clientY }
  }

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    const minX = Math.min(this.mouseStart.x, e.clientX)
    const maxX = Math.max(this.mouseStart.x, e.clientX)
    const minY = Math.min(this.mouseStart.y, e.clientY)
    const maxY = Math.max(this.mouseStart.y, e.clientY)

    this.marqueeBox = {
      minX,
      minY,
      maxX,
      maxY,
    }
    editor.state.marquee = this.marqueeBox
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    if (editor.state.marquee) {
      const marquee = editor.state.marquee
      editor.document.getShapeNodes().forEach(([node, shape]) => {
        const intersect =
          shape.type === "LINE"
            ? BoundingBoxService.lineIntersectsAABB(
                node.transform.x + shape.geometry.x1,
                node.transform.y + shape.geometry.y1,
                node.transform.x + shape.geometry.x2,
                node.transform.y + shape.geometry.y2,
                marquee,
              )
            : BoundingBoxService.aabbIntersects(
                marquee,
                BoundingBoxService.getAABB(node, shape),
              )
        if (intersect) {
          editor.selection.select(node.id)
        }
      })
    }
    this.marqueeBox = undefined
    editor.state.marquee = undefined
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }
}
