import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { DragState } from "../states/DragState"

/**
 * Priority 3: Selected Object Resolver
 * Detects clicks on already selected objects to initiate drag without changing selection
 */
export class SelectedObjectResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    const { editor } = ctx

    // Only handle if there's a hovered node
    if (!editor.state.hoveredNodeId) {
      return null
    }

    // Only treat it as "clicking already-selected object" when the hovered node
    // (or its default top-level parent) is actually part of the current selection.
    // This avoids blocking selection changes when shapes overlap.
    if (this.isHoveredShapeInCurrentSelection(e, editor)) {
      return new DragState()
    }

    return null
  }

  /**
   * Check if the hovered node corresponds to the current selection.
   * - Without Ctrl/Cmd: selection is considered at the top-level parent (group) level.
   * - With Ctrl/Cmd: selection is considered at the hovered node level (drill-down).
   */
  private isHoveredShapeInCurrentSelection(
    e: PointerEventData,
    editor: ToolContext["editor"],
  ): boolean {
    const hoveredNodeId = editor.state.hoveredNodeId
    if (!hoveredNodeId) return false

    return editor.selection.isSelected(hoveredNodeId)

    // Ctrl/Cmd: match selection exactly at hovered node level.
    // if (e.ctrlKey || e.metaKey) {
    //   return editor.selection.isSelected(hoveredNodeId)
    // }

    // // Default: match selection at top-level parent (group if it exists).
    // const topLevelParent = editor.document.getTopLevelParent(hoveredNodeId)
    // const selectionCandidateId =
    //   topLevelParent && topLevelParent.id !== hoveredNodeId
    //     ? topLevelParent.id
    //     : hoveredNodeId

    // return editor.selection.isSelected(selectionCandidateId)
  }
}

// Made with Bob
