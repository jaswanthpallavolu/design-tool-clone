// core/types/InputTypes.ts

/**
 * Platform-agnostic pointer event data
 * Contains transformed coordinates relative to the canvas/viewport
 */
export interface PointerEventData {
  /** X coordinate relative to canvas */
  clientX: number
  /** Y coordinate relative to canvas */
  clientY: number
  /** Whether shift key is pressed */
  shiftKey: boolean
  /** Whether ctrl/cmd key is pressed */
  ctrlKey: boolean
  /** Whether alt/option key is pressed */
  altKey: boolean
  /** Whether meta key is pressed */
  metaKey: boolean
  /** Mouse button pressed (0: left, 1: middle, 2: right) */
  button: number
}

// Made with Bob
