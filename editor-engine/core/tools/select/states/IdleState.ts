import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"

export class IdleState implements InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    let hoveringOnShape = false
    if (editor.state.hoveredNodeId) {
      const hoveredNode = editor.document.getNode(editor.state.hoveredNodeId)
      const hoveredShape = editor.document.getShape(editor.state.hoveredNodeId)
      if (
        hoveredNode &&
        hoveredShape &&
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(hoveredNode, hoveredShape, e.clientX, e.clientY)
      ) {
        hoveringOnShape = true
      }
    }
    if (!hoveringOnShape) {
      // Use ShapeQueryService for automatic spatial index optimization
      const found = editor.shapeQuery.findShapeAtPoint(
        e.clientX,
        e.clientY,
        editor.renderer?.getHitTestAdapter(),
      )
      editor.state.hoveredNodeId = found?.id
    }
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
