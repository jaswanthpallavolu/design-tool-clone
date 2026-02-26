import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"

export interface InteractionState {
  onPointerDown(e: PointerEventData, ctx: ToolContext): void
  onPointerMove(e: PointerEventData, ctx: ToolContext): void
  onPointerUp(e: PointerEventData, ctx: ToolContext): void
  onEnter?(ctx: ToolContext): void
  onExit?(ctx: ToolContext): void
}
