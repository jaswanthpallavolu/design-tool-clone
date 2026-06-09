import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { HandleHitResult } from "@/editor-engine/core/ports/HitTestPort"
import type { Editor } from "../../../Editor"

export class IdleState implements InteractionState {
  private lastPointerEvent: PointerEventData | null = null

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {}

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    this.lastPointerEvent = e
    this.updateHoverState(e, editor)
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): void {
    // Recalculate hover state when Ctrl/Meta is pressed
    if ((e.key === "Control" || e.key === "Meta") && this.lastPointerEvent) {
      // Create updated pointer event with current modifier key states
      const updatedPointerEvent: PointerEventData = {
        ...this.lastPointerEvent,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      }
      this.updateHoverState(updatedPointerEvent, ctx.editor)
    }
  }

  onKeyUp(e: KeyboardEvent, ctx: ToolContext): void {
    // Recalculate hover state when Ctrl/Meta is released
    if ((e.key === "Control" || e.key === "Meta") && this.lastPointerEvent) {
      // Create updated pointer event with current modifier key states
      const updatedPointerEvent: PointerEventData = {
        ...this.lastPointerEvent,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      }
      this.updateHoverState(updatedPointerEvent, ctx.editor)
    }
  }

  /**
   * Recalculate hover state based on current pointer position and modifier keys
   * Called when pointer moves or when Ctrl/Meta keys are pressed/released
   */
  private updateHoverState(e: PointerEventData, editor: Editor): void {
    const selection = editor.selection.getAll()
    if (selection.length === 1) {
      const handleHit = this.testSingleSelectionHandles(e, editor, selection[0])
      if (handleHit.type) {
        editor.state.setHoveredNodeId(undefined)
        return
      }
    }

    const found = editor.shapeQuery.findShapeAtPoint(
      e.clientX,
      e.clientY,
      editor.renderer?.getShapeHitTestAdapter(),
    )

    // If the found shape is selected, allow hovering on shapes (not groups)
    const isFoundShapeSelected =
      found?.id && editor.selection.isSelected(found.id)

    const topLevelParent =
      !(e.ctrlKey || e.metaKey) &&
      !isFoundShapeSelected &&
      editor.document.getTopLevelParent(found?.id ?? "")
    const selectionCandidateId =
      topLevelParent && topLevelParent.id !== found?.id
        ? topLevelParent.id
        : found?.id
    editor.state.setHoveredNodeId(selectionCandidateId)
  }

  private testSingleSelectionHandles(
    e: PointerEventData,
    editor: Editor,
    nodeId: string,
  ): HandleHitResult {
    const renderer = editor.renderer
    if (!renderer?.getHandleHitTestAdapter) {
      return { type: null, handle: null }
    }

    const handleAdapter = renderer.getHandleHitTestAdapter()
    if (!handleAdapter) {
      return { type: null, handle: null }
    }

    return handleAdapter.testHandles(e.clientX, e.clientY)
  }
}
