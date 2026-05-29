import type { InteractionState } from "../states/InteractionState"
import { BaseHandleResolver } from "./BaseHandleResolver"
import { RotateState } from "../states/RotateState"
import { HandleType } from "../../../ports/HitTestPort"

/**
 * Priority 2: Rotation Handle Resolver
 * Detects rotation handle hits for rotating operations
 */
export class RotationHandleResolver extends BaseHandleResolver {
  /**
   * Accept rotation handle type for rotate operations
   */
  protected isValidHandleType(type: HandleType | null): boolean {
    return type === HandleType.ROTATION
  }

  /**
   * Create a RotateState with the detected handle
   */
  protected createState(handle: unknown): InteractionState {
    return new RotateState(handle as string)
  }
}

// Made with Bob
