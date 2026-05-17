import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { StateResolver } from "./StateResolver"
import { MarqueeState } from "../states/MarqueeState"

/**
 * Priority 6: Background Resolver (Fallback)
 * Handles clicks on empty background - starts marquee selection
 * This is the final resolver in the chain and always returns a state
 */
export class BackgroundResolver extends StateResolver {
  protected tryResolve(
    e: PointerEventData,
    ctx: ToolContext,
  ): InteractionState | null {
    // Clear current selection and start marquee
    ctx.editor.selection.clear()
    ctx.editor.state.clearTransient()

    return new MarqueeState()
  }
}

// Made with Bob
