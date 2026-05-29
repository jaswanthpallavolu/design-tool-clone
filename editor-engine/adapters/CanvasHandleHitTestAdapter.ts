import {
  HandleHitTestPort,
  HandleHitResult,
  HandleType,
} from "../core/ports/HitTestPort"
import { HandlePaths } from "./CanvasPathBuilder"

interface HandleRenderContext {
  paths: HandlePaths
  centerX: number
  centerY: number
  rotation: number
}

/**
 * Canvas-based handle hit testing adapter using Path2D and Canvas API
 * Implements HandleHitTestPort using built-in Canvas hit testing
 */
export class CanvasHandleHitTestAdapter implements HandleHitTestPort {
  private ctx: CanvasRenderingContext2D
  private lastHandleContext: HandleRenderContext | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  /**
   * Store handle paths and transform context from rendering
   * Must be called after rendering handles
   */
  setHandleContext(
    paths: HandlePaths,
    centerX: number,
    centerY: number,
    rotation: number,
  ): void {
    this.lastHandleContext = { paths, centerX, centerY, rotation }
  }

  /**
   * Clear stored handle context
   */
  clearHandleContext(): void {
    this.lastHandleContext = null
  }

  /**
   * Test if mouse position hits any handle
   * Uses Canvas API's isPointInPath/isPointInStroke with stored paths
   */
  testHandles(mouseX: number, mouseY: number): HandleHitResult {
    if (!this.lastHandleContext) {
      return { type: null, handle: null }
    }

    const { paths, centerX, centerY, rotation } = this.lastHandleContext

    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(rotation)

    // Test rotation handles first (highest priority, outermost)
    for (const [key, path] of Object.entries(paths.rotation)) {
      if (this.ctx.isPointInPath(path, mouseX, mouseY)) {
        this.ctx.restore()
        return { type: HandleType.ROTATION, handle: key }
      }
    }

    // Test corner handles (resize diagonally)
    for (const [key, path] of Object.entries(paths.corners)) {
      if (this.ctx.isPointInPath(path, mouseX, mouseY)) {
        this.ctx.restore()
        return { type: HandleType.CORNER, handle: key }
      }
    }

    // Test edge handles (resize single axis)
    // Use isPointInStroke for line-based edge handles
    this.ctx.lineWidth = 10 // Match the hit area threshold
    for (const [key, path] of Object.entries(paths.edges)) {
      if (this.ctx.isPointInStroke(path, mouseX, mouseY)) {
        this.ctx.restore()
        return { type: HandleType.EDGE, handle: key }
      }
    }

    this.ctx.restore()
    return { type: null, handle: null }
  }
}

// Made with Bob
