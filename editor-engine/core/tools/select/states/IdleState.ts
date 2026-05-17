import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"

export class IdleState implements InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    // Use ShapeQueryService with priority check for currently hovered shape
    // This optimizes hover tracking by checking the current shape first
    const found = editor.shapeQuery.findShapeAtPoint(
      e.clientX,
      e.clientY,
      editor.renderer?.getHitTestAdapter(),
      editor.state.hoveredNodeId, // Check current hover first to avoid recomputation
    )
    editor.state.hoveredNodeId = found?.id
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
