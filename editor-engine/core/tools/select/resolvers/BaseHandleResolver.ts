import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { HandleHitResult, HandleType } from "../../../ports/HitTestPort"
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
   * Uses Canvas API hit testing via the renderer's handle adapter
   */
  protected testHandles(e: PointerEventData, editor: Editor): HandleHitResult {
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

  /**
   * Check if the handle type is valid for this resolver
   * Subclasses override to specify which handle types they accept
   */
  protected abstract isValidHandleType(type: HandleType | null): boolean

  /**
   * Create the appropriate state for this resolver
   * Subclasses override to return their specific state type
   */
  protected abstract createState(handle: unknown): InteractionState
}

// Made with Bob
