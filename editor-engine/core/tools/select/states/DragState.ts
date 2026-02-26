import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class DragState implements InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}
  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }
  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
