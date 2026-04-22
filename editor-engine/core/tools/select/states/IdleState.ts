import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"

export class IdleState implements InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    let hoveringOnShape = false
    if (editor.state.hoveredShapeId) {
      const hoveredNode = editor.document.getNode(editor.state.hoveredShapeId)
      const hoveredShape = editor.document.getShape(editor.state.hoveredShapeId)
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
      const shapeNodes = editor.document.getShapeNodes()
      const found = shapeNodes.find(([node, shape]) =>
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(node, shape, e.clientX, e.clientY),
      )
      editor.state.hoveredShapeId = found ? found[0].id : undefined
    }
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
