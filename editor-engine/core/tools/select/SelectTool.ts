import { Tool, ToolContext } from "../Tool"
import type { PointerEventData } from "../../types/InputTypes"
import type { InteractionState } from "./states/InteractionState"
import { IdleState } from "./states/IdleState"
import { StateTransitionResolver } from "./strategies/StateTransitionResolver"

/**
 * SelectTool - Main tool for selecting, moving, resizing, and rotating shapes
 *
 * Uses Strategy Pattern for state resolution:
 * - HandleHitStrategy: Detects handle interactions (resize, rotate)
 * - SelectionStrategy: Handles shape selection and drag initiation
 * - StateTransitionResolver: Coordinates strategies using Chain of Responsibility
 *
 * Uses State Pattern for interaction modes:
 * - IdleState: Default state, no interaction
 * - DragState: Moving selected shapes
 * - MarqueeState: Box selection
 * - ResizeState: Resizing shapes
 * - RotateState: Rotating shapes
 */
export class SelectTool implements Tool {
  readonly id = "select"
  private currentState: InteractionState = new IdleState()
  private stateResolver: StateTransitionResolver

  constructor() {
    this.stateResolver = new StateTransitionResolver()
  }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    const nextState = this.stateResolver.resolve(e, ctx)
    this.transitionTo(nextState, ctx)
    this.currentState.onPointerDown(e, ctx)
    ctx.renderOverlays()
  }

  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    this.currentState.onPointerMove(e, ctx)
    ctx.renderOverlays()
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    this.currentState.onPointerUp(e, ctx)
    this.transitionTo(new IdleState(), ctx)
    ctx.renderOverlays()
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): void {
    // Delete selected shapes
    if (e.key === "Delete" || e.key === "Backspace") {
      this.handleDelete(ctx)
      e.preventDefault()
    }
  }

  private handleDelete(ctx: ToolContext): void {
    const selectedIds = ctx.editor.selection.getAll()

    if (selectedIds.length === 0) return

    // Remove all selected nodes (and their shapes) from document
    selectedIds.forEach((id) => {
      ctx.editor.document.removeNode(id)
    })

    // Clear selection and transient state
    ctx.editor.selection.clear()
    ctx.editor.state.clearTransient()

    // Re-render
    ctx.editor.renderer?.renderShapes()
    ctx.renderOverlays()
  }

  private transitionTo(state: InteractionState, ctx: ToolContext): void {
    this.currentState.onExit?.(ctx)
    this.currentState = state
    this.currentState.onEnter?.(ctx)
  }
}
