import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { RotateState } from "../states/RotateState"
import {
  HandleHitTestService,
  HandleHitResult,
} from "../../../services/HandleHitTestService"
import { HandleGeometryService } from "../../../services/HandleGeometryService"
import type { Editor } from "../../../Editor"

/**
 * Priority 2: Rotation Handle Resolver
 * Detects rotation handle hits for rotating operations
 */
export class RotationHandleResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    const handleHit = this.testRotationHandles(e, ctx.editor)

    if (handleHit.type === "rotation" && handleHit.handle) {
      return new RotateState(handleHit.handle)
    }

    return null
  }

  /**
   * Test if pointer hits any rotation handle
   */
  private testRotationHandles(
    e: PointerEventData,
    editor: Editor,
  ): HandleHitResult {
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
