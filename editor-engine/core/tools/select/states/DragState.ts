import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { Shape } from "@/editor-engine/core/model/Shape"

export class DragState implements InteractionState {
  prevMouseX: number = 0
  prevMouseY: number = 0

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
  }
  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const deltaX = e.clientX - this.prevMouseX
    const deltaY = e.clientY - this.prevMouseY
    editor.selection.getAll().forEach((shapeId) => {
      const shape = editor.document.getById(shapeId)
      if (shape) {
        switch (shape.kind) {
          case "line":
            shape.p1.x += deltaX
            shape.p1.y += deltaY
            shape.p2.x += deltaX
            shape.p2.y += deltaY
            break
          default:
            shape.p1.x += deltaX
            shape.p1.y += deltaY
        }
        editor.document.update(shape)
      }
    })
    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }
  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
