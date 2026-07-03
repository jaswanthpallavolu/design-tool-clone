import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { DragState } from "../states/DragState"

/**
 * Priority 3: Selected Object Resolver
 * Detects clicks on already selected objects to initiate drag without changing selection.
 *
 * Re-resolves the click target at pointer-down time (not from the potentially stale
 * hoveredNodeId) so that clicking inside an already-selected group correctly drills
 * down to the child group/shape rather than re-dragging the outer group.
 */
export class SelectedObjectResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    const { editor } = ctx

    // Re-resolve the actual click target using the live selection state.
    // hoveredNodeId may be stale (computed on the last pointermove before the
    // selection changed), so we recompute here to get the right target.
    const target = this.resolveClickTarget(e, ctx)
    if (!target) return null

    if (editor.selection.isSelected(target)) {
      // Target is already selected — drag it without changing selection.
      return new DragState()
    }

    // Target is not selected but its ancestor is — the click landed inside a
    // selected group. Drag the selected group as-is; do NOT drill into it.
    const isInsideSelectedAncestor = this.hasSelectedAncestor(target, editor)
    if (isInsideSelectedAncestor) {
      return new DragState()
    }

    return null
  }

  /**
   * Recompute the click target from the current hit-test result.
   * Walks up the ancestor chain to find the highest node that is already
   * selected (or whose child toward the hit node is selected), so that
   * clicking on a selected shape inside a group correctly identifies that
   * shape (or its selected ancestor group) as the drag target.
   */
  private resolveClickTarget(
    e: PointerEventData,
    ctx: ToolContext,
  ): string | null {
    const { editor } = ctx

    const found = editor.shapeQuery.findShapeAtPoint(
      e.clientX,
      e.clientY,
      editor.renderer?.getShapeHitTestAdapter(),
    )
    if (!found?.id) return null

    if (e.ctrlKey || e.metaKey) return found.id

    // Build chain innermost-first: [found.id, parent, grandparent, …, root]
    let current = editor.document.getNode(found.id)
    const chain: string[] = []
    while (current) {
      chain.push(current.id)
      current = current.parentId
        ? editor.document.getNode(current.parentId)
        : undefined
    }

    // Find the deepest selected node in the chain (the hit shape itself or
    // any of its ancestors) and return it as the drag target.
    for (let i = 0; i < chain.length; i++) {
      if (editor.selection.isSelected(chain[i])) return chain[i]
    }

    // Nothing in the chain is selected — not our concern, pass to next resolver.
    return null
  }

  /**
   * Returns true if any ancestor of `nodeId` is currently selected.
   */
  private hasSelectedAncestor(nodeId: string, editor: ToolContext["editor"]): boolean {
    let node = editor.document.getNode(nodeId)
    while (node?.parentId) {
      if (editor.selection.isSelected(node.parentId)) return true
      node = editor.document.getNode(node.parentId)
    }
    return false
  }
}

// Made with Bob
