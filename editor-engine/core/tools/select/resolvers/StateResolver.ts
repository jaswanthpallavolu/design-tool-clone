import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"

/**
 * Base class for Chain of Responsibility pattern
 * Each resolver in the chain attempts to handle the pointer event
 * and determine the next interaction state
 */
export abstract class StateResolver {
  protected nextResolver: StateResolver | null = null

  /**
   * Set the next resolver in the chain
   */
  setNext(resolver: StateResolver): StateResolver {
    this.nextResolver = resolver
    return resolver
  }

  /**
   * Handle the request - try to resolve state, or pass to next in chain
   */
  resolve(e: PointerEventData, ctx: ToolContext): InteractionState | null {
    const state = this.tryResolve(e, ctx)

    if (state !== null) {
      return state
    }

    // Pass to next resolver in chain
    if (this.nextResolver) {
      return this.nextResolver.resolve(e, ctx)
    }

    return null
  }

  /**
   * Attempt to resolve the state
   * Subclasses implement their specific logic here
   * @returns InteractionState if this resolver can handle it, null otherwise
   */
  protected abstract tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null
}

// Made with Bob
