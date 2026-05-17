import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import {
  HandleHitTestService,
  HandleHitResult,
} from "../../../services/HandleHitTestService"
import { HandleGeometryService } from "../../../services/HandleGeometryService"
import type { Editor } from "../../../Editor"

/**
 * Base class for handle-based resolvers (Resize and Rotation)
 * Eliminates code duplication by providing shared handle testing logic
 */
export abstract class BaseHandleResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    const handleHit = this.testHandles(e, ctx.editor)

    if (this.isValidHandleType(handleHit.type) && handleHit.handle) {
      return this.createState(handleHit.handle)
    }

    return null
  }

  /**
   * Test if pointer hits any handle of the appropriate type
   */
  protected testHandles(e: PointerEventData, editor: Editor): HandleHitResult {
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
  protected testAABBHandles(
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
  protected testSingleSelectionHandles(
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

  /**
   * Check if the handle type is valid for this resolver
   * Subclasses override to specify which handle types they accept
   */
  protected abstract isValidHandleType(type: string | null): boolean

  /**
   * Create the appropriate state for this resolver
   * Subclasses override to return their specific state type
   */
  protected abstract createState(handle: unknown): InteractionState
}

// Made with Bob
