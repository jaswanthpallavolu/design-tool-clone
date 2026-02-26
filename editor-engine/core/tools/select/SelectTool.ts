import { Tool, ToolContext } from "../Tool"
import type { PointerEventData } from "../../types/InputTypes"
import type { InteractionState } from "./states/InteractionState"
import { IdleState } from "./states/IdleState"
import { DragState } from "./states/DragState"
import { MarqueeState } from "./states/MarqueeState"
import { SelectionBoundsHelper } from "./helpers/SelectionBoundsHelper"

export class SelectTool implements Tool {
  readonly id = "select"
  private currentState: InteractionState = new IdleState()

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    const nextState = this.determineNextState(e, ctx)
    this.transitionTo(nextState, ctx)
    this.currentState.onPointerDown(e, ctx)
    this.renderSelection(ctx)
  }

  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    this.currentState.onPointerMove(e, ctx)
    this.renderSelection(ctx)
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    this.currentState.onPointerUp(e, ctx)
    const next = new IdleState()
    this.transitionTo(next, ctx)
    this.currentState.onPointerUp(e, ctx)
    this.renderSelection(ctx)
  }

  private transitionTo(state: InteractionState, ctx: ToolContext): void {
    this.currentState.onExit?.(ctx)
    this.currentState = state
    this.currentState.onEnter?.(ctx)
  }

  private determineNextState(
    e: PointerEventData,
    { editor }: ToolContext,
  ): InteractionState {
    if (editor.state.hoveredShapeId) {
      if (e.shiftKey) editor.selection.select(editor.state.hoveredShapeId)
      else editor.selection.setSingle(editor.state.hoveredShapeId)
      SelectionBoundsHelper.updateSelectionBounds({ editor })
      return new DragState()
    }
    editor.selection.clear()
    editor.state.clearTransient()
    return new MarqueeState()
  }

  private renderSelection(ctx: ToolContext): void {
    const { editor } = ctx
    editor.renderer?.clearSelectionBox()
    editor.renderer?.renderHoverOutline()
    editor.renderer?.renderSelectionBox()
    editor.renderer?.renderSelectionBounds()
  }
}
