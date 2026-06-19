import { Tool, ToolContext } from "../Tool"
import type { PointerEventData } from "../../types/InputTypes"
import type { InteractionState } from "./states/InteractionState"
import { IdleState } from "./states/IdleState"
import { StateTransitionResolver } from "./resolvers/StateTransitionResolver"
import { DeleteShapesCommand } from "../../commands"
import { SelectionBoundsHelper } from "./helpers/SelectionBoundsHelper"

/**
 * SelectTool - Main tool for selecting, moving, resizing, and rotating shapes
 *
 * Uses Chain of Responsibility Pattern for state resolution:
 * - StateTransitionResolver: Coordinates resolver chain to determine next state
 * - Resolvers process pointer events in priority order (handles → selection → background)
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
  private unsubscribeSelectionChanged?: () => void

  constructor() {
    this.stateResolver = new StateTransitionResolver()
  }

  onActivate(ctx: ToolContext): void {
    // Subscribe to selection changes to update bounds reactively
    this.unsubscribeSelectionChanged = ctx.editor.events.on(
      "selection:changed",
      () => {
        SelectionBoundsHelper.updateSelectionBounds(ctx)
        ctx.renderOverlays()
      },
    )

    // Update bounds immediately when tool activates
    SelectionBoundsHelper.updateSelectionBounds(ctx)
    ctx.renderOverlays()
  }

  onDeactivate(ctx: ToolContext): void {
    // Unsubscribe from selection changes
    this.unsubscribeSelectionChanged?.()
    this.unsubscribeSelectionChanged = undefined

    // Clear selection bounds when tool deactivates
    SelectionBoundsHelper.clearSelectionBounds(ctx)
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
      return
    }

    // Delegate to current state
    this.currentState.onKeyDown?.(e, ctx)
    ctx.renderOverlays()
  }

  onKeyUp(e: KeyboardEvent, ctx: ToolContext): void {
    // Delegate to current state
    this.currentState.onKeyUp?.(e, ctx)
    ctx.renderOverlays()
  }

  private handleDelete(ctx: ToolContext): void {
    const selectedIds = ctx.editor.selection.getAll()

    if (selectedIds.length === 0) return

    // Execute delete command (enables undo/redo)
    ctx.editor.commands.execute(
      new DeleteShapesCommand(ctx.editor, [...selectedIds]),
    )

    // Re-render overlays
    ctx.renderOverlays()
  }

  private transitionTo(state: InteractionState, ctx: ToolContext): void {
    this.currentState.onExit?.(ctx)
    this.currentState = state
    this.currentState.onEnter?.(ctx)
  }
}
