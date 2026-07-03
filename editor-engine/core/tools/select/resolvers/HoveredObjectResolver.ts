import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { DragState } from "../states/DragState"
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
    const nodeToSelect = this.determineNodeToSelect(e, editor)

    if (!nodeToSelect) {
      return null
    }

    // Return DragState with selection context - let the state handle the selection
    return new DragState({
      nodeToSelect,
      shouldAddToSelection: e.shiftKey,
    })
  }

  /**
   * Determine which node to select based on modifier keys and hierarchy
   */
  private determineNodeToSelect(
    e: PointerEventData,
    editor: Editor,
  ): string | null {
    const hoveredNodeId = editor.state.hoveredNodeId

    if (!hoveredNodeId) {
      return null
    }

    // hoveredNodeId is already the resolved selection target from hover logic.
    // Cmd/Ctrl handling is already applied there as well.
    return hoveredNodeId
  }
}

// Made with Bob
