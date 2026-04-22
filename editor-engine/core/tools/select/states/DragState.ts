import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

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
    editor.selection.getAll().forEach((nodeId) => {
      const node = editor.document.getNode(nodeId)
      if (node) {
        node.transform.x += deltaX
        node.transform.y += deltaY
        editor.document.updateNode(node)
      }
    })
    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }
  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
