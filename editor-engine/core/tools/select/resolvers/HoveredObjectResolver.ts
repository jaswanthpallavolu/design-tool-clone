import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { DragState } from "../states/DragState"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import type { Editor } from "../../../Editor"

/**
 * Priority 4: Hovered Object Resolver
 * Handles selection of hovered objects (not yet selected) and initiates drag
 * Respects modifier keys for group selection and multi-selection
 */
export class HoveredObjectResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    const { editor } = ctx

    // Only handle if there's a hovered node
    if (!editor.state.hoveredNodeId) {
      return null
    }

    // Determine what to select: group or individual shape
    const nodeToSelect = this.determineNodeToSelect(e, editor)

    // Apply selection based on modifier keys
    this.applySelection(e, editor, nodeToSelect)

    // Update selection bounds
    SelectionBoundsHelper.updateSelectionBounds(ctx)

    return new DragState()
  }

  /**
   * Determine which node to select based on modifier keys and hierarchy
   */
  private determineNodeToSelect(e: PointerEventData, editor: Editor): string {
    const hoveredNodeId = editor.state.hoveredNodeId!

    // If Cmd/Ctrl is held, select the individual shape (drill down into groups)
    if (e.ctrlKey || e.metaKey) {
      return hoveredNodeId
    }

    // Otherwise, select the top-level parent (group if exists)
    const topLevelParent = editor.document.getTopLevelParent(hoveredNodeId)

    if (topLevelParent && topLevelParent.id !== hoveredNodeId) {
      // The shape is inside a group, select the group instead
      return topLevelParent.id
    }

    return hoveredNodeId
  }

  /**
   * Apply selection based on modifier keys
   * - Shift: Add to selection
   * - No modifier: Replace selection
   */
  private applySelection(
    e: PointerEventData,
    editor: Editor,
    nodeId: string,
  ): void {
    if (e.shiftKey) {
      editor.selection.select(nodeId)
    } else {
      editor.selection.setSingle(nodeId)
    }
  }
}

// Made with Bob
