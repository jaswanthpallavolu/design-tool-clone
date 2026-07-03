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

    if (!found?.id) {
      editor.state.setHoveredNodeId(undefined)
      return
    }

    if (e.ctrlKey || e.metaKey) {
      // Cmd/Ctrl: drill all the way down to the exact hit shape
      editor.state.setHoveredNodeId(found.id)
      return
    }

    // Walk up the ancestor chain and stop at the highest ancestor that is NOT
    // already selected — that is the natural "select target" for this click.
    // This lets the user click into an already-selected group to pick a child
    // group (or shape) without needing Cmd/Ctrl.
    const selectionCandidateId = this.resolveSelectionCandidate(found.id, editor)
    editor.state.setHoveredNodeId(selectionCandidateId)
  }

  /**
   * Resolve the hover/selection candidate for a hit node.
   *
   * Strategy: find the deepest (innermost) selected ancestor in the chain,
   * then return its immediate child toward the hit node. This lets each click
   * drill one level deeper into the selected subtree.
   * When no ancestor is selected, return the direct parent group (or the node
   * itself when it sits at root level).
   *
   * Examples (→ = returned value):
   *   nothing selected:   Group0 > Group1 > Line  →  Group1
   *   Group1 selected:    Group0 > Group1 > Line  →  Line
   *   Group0 selected:    Group0 > Group1 > Line  →  Group1
   *   Group0+Group1 sel:  Group0 > Group1 > Line  →  Line
   */
  private resolveSelectionCandidate(nodeId: string, editor: Editor): string {
    let current = editor.document.getNode(nodeId)
    if (!current) return nodeId

    // Build the chain innermost-first: [nodeId, parent, grandparent, …, root]
    const chain: string[] = []
    while (current) {
      chain.push(current.id)
      current = current.parentId
        ? editor.document.getNode(current.parentId)
        : undefined
    }

    // chain[0] = nodeId (the hit shape), chain[last] = root ancestor.
    // Find the deepest selected ancestor (closest to nodeId).
    // chain[1] is the direct parent, chain[2] the grandparent, etc.
    for (let i = 1; i < chain.length; i++) {
      if (editor.selection.isSelected(chain[i])) {
        // chain[i] is selected; the child one step toward the hit node is chain[i-1].
        return chain[i - 1]
      }
    }

    // No ancestor is selected — return the direct parent (chain[1]),
    // or the node itself if it has no parent (already at root level).
    return chain.length > 1 ? chain[1] : nodeId
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
