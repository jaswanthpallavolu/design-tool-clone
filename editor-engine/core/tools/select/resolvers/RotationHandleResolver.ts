import type { InteractionState } from "../states/InteractionState"
import { BaseHandleResolver } from "./BaseHandleResolver"
import { RotateState } from "../states/RotateState"

/**
 * Priority 2: Rotation Handle Resolver
 * Detects rotation handle hits for rotating operations
 */
export class RotationHandleResolver extends BaseHandleResolver {
  /**
   * Accept rotation handle type for rotate operations
   */
  protected isValidHandleType(type: string | null): boolean {
    return type === "rotation"
  }

  /**
   * Create a RotateState with the detected handle
   */
  protected createState(handle: unknown): InteractionState {
    return new RotateState(handle as string)
  }
}

// Made with Bob
