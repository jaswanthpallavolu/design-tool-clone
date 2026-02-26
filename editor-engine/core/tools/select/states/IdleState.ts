import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"

export class IdleState implements InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}
  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    let hoveringOnShape = false
    if (editor.state.hoveredShapeId) {
      const hoveredShape = editor.document.getById(editor.state.hoveredShapeId)
      if (
        hoveredShape &&
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(hoveredShape, e.clientX, e.clientY)
      ) {
        hoveringOnShape = true
      }
    }
    if (!hoveringOnShape) {
      editor.state.hoveredShapeId = editor.document
        .getAll()
        .find((shape) =>
          editor.renderer
            ?.getHitTestAdapter()
            ?.testShape(shape, e.clientX, e.clientY),
        )?.id
    }
  }
  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
