import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"

/**
 * Strategy interface for resolving the next interaction state
 * based on pointer events and editor context
 */
export interface StateResolutionStrategy {
  /**
   * Attempt to resolve the next state based on the current context
   * @returns InteractionState if this strategy can handle the situation, null otherwise
   */
  resolve(e: PointerEventData, ctx: ToolContext): InteractionState | null
}

// Made with Bob
