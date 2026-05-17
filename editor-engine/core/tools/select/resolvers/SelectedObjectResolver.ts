import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { DragState } from "../states/DragState"
import { BoundingBoxService } from "../../../services/BoundingBoxService"

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

    // Check if the hovered shape is within the current selection bounds
    if (this.isHoveredShapeInSelection(editor)) {
      return new DragState()
    }

    return null
  }

  /**
   * Check if the hovered shape is within the current selection bounds
   * This allows dragging without changing the selection
   */
  private isHoveredShapeInSelection(editor: ToolContext["editor"]): boolean {
    const hoveredNodeId = editor.state.hoveredNodeId
    if (!hoveredNodeId) return false

    const hoveredNode = editor.document.getNode(hoveredNodeId)
    const hoveredShape = editor.document.getShape(hoveredNodeId)

    // Check if the hovered shape is within the selection bounds
    if (hoveredNode && hoveredShape && editor.state.selectionBounds) {
      return BoundingBoxService.aabbIntersects(
        editor.state.selectionBounds,
        BoundingBoxService.getAABB(hoveredNode, hoveredShape),
      )
    }

    return false
  }
}

// Made with Bob
