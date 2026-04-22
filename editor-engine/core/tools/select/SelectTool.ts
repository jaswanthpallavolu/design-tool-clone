import { Tool, ToolContext } from "../Tool"
import type { PointerEventData } from "../../types/InputTypes"
import type { InteractionState } from "./states/InteractionState"
import { IdleState } from "./states/IdleState"
import { DragState } from "./states/DragState"
import { MarqueeState } from "./states/MarqueeState"
import { ResizeState } from "./states/ResizeState"
import { RotateState } from "./states/RotateState"
import { SelectionBoundsHelper } from "./helpers/SelectionBoundsHelper"
import { BoundingBoxService } from "../../services/BoundingBoxService"
import {
  HandleHitTestService,
  HandleHitResult,
} from "../../services/HandleHitTestService"
import { HandleGeometryService } from "../../services/HandleGeometryService"

export class SelectTool implements Tool {
  readonly id = "select"
  private currentState: InteractionState = new IdleState()

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    const nextState = this.determineNextState(e, ctx)
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
    const next = new IdleState()
    this.transitionTo(next, ctx)
    this.currentState.onPointerUp(e, ctx)
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

  private determineNextState(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState {
    const { editor } = ctx

    // 1. Check handle hit first (highest priority)
    const handleHit = this.testHandleHit(e, editor)
    if (handleHit.type === "rotation" && handleHit.handle) {
      return new RotateState(handleHit.handle)
    }
    if (
      (handleHit.type === "corner" || handleHit.type === "edge") &&
      handleHit.handle
    ) {
      return new ResizeState(handleHit.handle)
    }

    // 2. Check shape hit (existing logic)
    if (editor.state.hoveredShapeId) {
      // Determine what to select: group or individual shape
      let nodeToSelect = editor.state.hoveredShapeId

      // If Cmd/Ctrl is NOT held, select the top-level parent (group if exists)
      if (!e.ctrlKey && !e.metaKey) {
        const topLevelParent = editor.document.getTopLevelParent(
          editor.state.hoveredShapeId,
        )
        if (
          topLevelParent &&
          topLevelParent.id !== editor.state.hoveredShapeId
        ) {
          // The shape is inside a group, select the group instead
          nodeToSelect = topLevelParent.id
        }
      }

      // Check if the hovered shape is in selectionBounds (for drag detection)
      const hoveredNode = editor.document.getNode(editor.state.hoveredShapeId)
      const hoveredShape = editor.document.getShape(editor.state.hoveredShapeId)
      if (hoveredNode && hoveredShape && editor.state.selectionBounds) {
        if (
          BoundingBoxService.aabbIntersects(
            editor.state.selectionBounds,
            BoundingBoxService.getAABB(hoveredNode, hoveredShape),
          )
        )
          return new DragState()
      }

      // Select the determined node (group or individual shape)
      if (e.shiftKey) editor.selection.select(nodeToSelect)
      else editor.selection.setSingle(nodeToSelect)
      SelectionBoundsHelper.updateSelectionBounds(ctx)
      return new DragState()
    }

    // 3. Start marquee selection
    editor.selection.clear()
    editor.state.clearTransient()
    return new MarqueeState()
  }

  private testHandleHit(
    e: PointerEventData,
    editor: ToolContext["editor"],
  ): HandleHitResult {
    const selection = editor.selection.getAll()

    // Test for multi-select AABB handles
    if (editor.state.selectionBounds && selection.length > 1) {
      const geometry = HandleGeometryService.getAABBHandleGeometry(
        editor.state.selectionBounds,
      )
      const center = HandleHitTestService.getAABBCenter(
        editor.state.selectionBounds,
      )
      return HandleHitTestService.testHandles(
        e.clientX,
        e.clientY,
        geometry,
        center.x,
        center.y,
        0, // AABB has no rotation
      )
    }

    // Test for single selection handles (shape or group)
    if (selection.length === 1) {
      const node = editor.document.getNode(selection[0])
      const shape = editor.document.getShape(selection[0])

      // If it's a group (no shape), use AABB handles
      if (node && !shape && editor.state.selectionBounds) {
        const geometry = HandleGeometryService.getAABBHandleGeometry(
          editor.state.selectionBounds,
        )
        const center = HandleHitTestService.getAABBCenter(
          editor.state.selectionBounds,
        )
        return HandleHitTestService.testHandles(
          e.clientX,
          e.clientY,
          geometry,
          center.x,
          center.y,
          0, // AABB has no rotation
        )
      } else if (node && shape) {
        // Single shape: use shape-specific handles
        const geometry = HandleGeometryService.getShapeHandleGeometry(shape)
        const center = HandleHitTestService.getShapeCenter(node, shape)
        return HandleHitTestService.testHandles(
          e.clientX,
          e.clientY,
          geometry,
          center.x,
          center.y,
          node.transform.rotation,
        )
      }
    }

    return { type: null, handle: null }
  }
}
