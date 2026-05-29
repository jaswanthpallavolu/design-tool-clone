import type { InteractionState } from "../states/InteractionState"
import { BaseHandleResolver } from "./BaseHandleResolver"
import { ResizeState } from "../states/ResizeState"
import { HandleType } from "../../../ports/HitTestPort"

/**
 * Priority 1: Resize Handle Resolver
 * Detects corner and edge handle hits for resizing operations
 */
export class ResizeHandleResolver extends BaseHandleResolver {
  /**
   * Accept corner and edge handle types for resize operations
   */
  protected isValidHandleType(type: HandleType | null): boolean {
    return type === HandleType.CORNER || type === HandleType.EDGE
  }

  /**
   * Create a ResizeState with the detected handle
   */
  protected createState(handle: unknown): InteractionState {
    return new ResizeState(handle as string)
  }
}

// Made with Bob
