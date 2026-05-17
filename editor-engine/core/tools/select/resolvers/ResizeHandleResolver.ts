import type { InteractionState } from "../states/InteractionState"
import { BaseHandleResolver } from "./BaseHandleResolver"
import { ResizeState } from "../states/ResizeState"

/**
 * Priority 1: Resize Handle Resolver
 * Detects corner and edge handle hits for resizing operations
 */
export class ResizeHandleResolver extends BaseHandleResolver {
  /**
   * Accept corner and edge handle types for resize operations
   */
  protected isValidHandleType(type: string | null): boolean {
    return type === "corner" || type === "edge"
  }

  /**
   * Create a ResizeState with the detected handle
   */
  protected createState(handle: unknown): InteractionState {
    return new ResizeState(handle as string)
  }
}

// Made with Bob
