import type { PointerEventData } from "../../../types/InputTypes"
import type { ToolContext } from "../../Tool"
import type { InteractionState } from "../states/InteractionState"
import { IdleState } from "../states/IdleState"
import { ResizeHandleResolver } from "../resolvers/ResizeHandleResolver"
import { RotationHandleResolver } from "../resolvers/RotationHandleResolver"
import { SelectedObjectResolver } from "../resolvers/SelectedObjectResolver"
import { HoveredObjectResolver } from "../resolvers/HoveredObjectResolver"
import { BackgroundResolver } from "../resolvers/BackgroundResolver"

/**
 * Coordinates state resolution using Chain of Responsibility pattern
 *
 * Priority order (highest to lowest):
 * 1. Resize Handles - Corner and edge handles for resizing
 * 2. Rotation Handles - Rotation handles for rotating
 * 3. Selected Objects - Clicking on already selected objects (drag without changing selection)
 * 4. Hovered Objects - Clicking on new objects (select and drag)
 * 5. Regular Shapes - (merged with Hovered Objects)
 * 6. Background - Empty space (marquee selection)
 */
export class StateTransitionResolver {
  private chainHead: ResizeHandleResolver

  constructor() {
    // Build the chain of responsibility in priority order
    const resizeResolver = new ResizeHandleResolver()
    const rotationResolver = new RotationHandleResolver()
    const selectedObjectResolver = new SelectedObjectResolver()
    const hoveredObjectResolver = new HoveredObjectResolver()
    const backgroundResolver = new BackgroundResolver()

    // Link the chain
    resizeResolver
      .setNext(rotationResolver)
      .setNext(selectedObjectResolver)
      .setNext(hoveredObjectResolver)
      .setNext(backgroundResolver)

    this.chainHead = resizeResolver
  }

  /**
   * Resolve the next interaction state based on pointer event and context
   * Delegates to the chain of resolvers
   */
  resolve(e: PointerEventData, ctx: ToolContext): InteractionState {
    const state = this.chainHead.resolve(e, ctx)

    // Chain should always return a state (BackgroundResolver is the fallback)
    return state ?? new IdleState()
  }
}

// Made with Bob
