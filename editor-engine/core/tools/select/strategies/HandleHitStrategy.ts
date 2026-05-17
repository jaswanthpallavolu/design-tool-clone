import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolutionStrategy } from "./StateResolutionStrategy"
import { RotateState } from "../states/RotateState"
import { ResizeState } from "../states/ResizeState"
import {
  HandleHitTestService,
  HandleHitResult,
} from "../../../services/HandleHitTestService"
import { HandleGeometryService } from "../../../services/HandleGeometryService"
import type { Editor } from "../../../Editor"

/**
 * Strategy for resolving handle hit interactions
 * Handles rotation and resize handle detection
 */
export class HandleHitStrategy implements StateResolutionStrategy {
  resolve(e: PointerEventData, ctx: ToolContext): InteractionState | null {
    const handleHit = this.testHandleHit(e, ctx.editor)

    if (handleHit.type === "rotation" && handleHit.handle) {
      return new RotateState(handleHit.handle)
    }

    if (
      (handleHit.type === "corner" || handleHit.type === "edge") &&
      handleHit.handle
    ) {
      return new ResizeState(handleHit.handle)
    }

    return null
  }

  /**
   * Test if pointer hits any handle (rotation, corner, or edge)
   */
  private testHandleHit(e: PointerEventData, editor: Editor): HandleHitResult {
    const selection = editor.selection.getAll()

    // Test for multi-select AABB handles
    if (editor.state.selectionBounds && selection.length > 1) {
      return this.testAABBHandles(e, editor)
    }

    // Test for single selection handles (shape or group)
    if (selection.length === 1) {
      return this.testSingleSelectionHandles(e, editor, selection[0])
    }

    return { type: null, handle: null }
  }

  /**
   * Test AABB handles for multi-selection or groups
   */
  private testAABBHandles(
    e: PointerEventData,
    editor: Editor,
  ): HandleHitResult {
    if (!editor.state.selectionBounds) {
      return { type: null, handle: null }
    }

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

  /**
   * Test handles for a single selected node (shape or group)
   */
  private testSingleSelectionHandles(
    e: PointerEventData,
    editor: Editor,
    nodeId: string,
  ): HandleHitResult {
    const node = editor.document.getNode(nodeId)
    const shape = editor.document.getShape(nodeId)

    // If it's a group (no shape), use AABB handles
    if (node && !shape && editor.state.selectionBounds) {
      return this.testAABBHandles(e, editor)
    }

    // Single shape: use shape-specific handles
    if (node && shape) {
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

    return { type: null, handle: null }
  }
}

// Made with Bob
