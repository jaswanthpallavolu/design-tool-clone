import { Node } from "../model/Node"
import { Shape } from "../model/Shape"
import { AABB } from "../services/BoundingBoxService"

/**
 * Handle paths for hit testing
 */
export interface HandlePaths {
  corners: Record<string, Path2D>
  edges: Record<string, Path2D>
  rotation: Record<string, Path2D>
}

/**
 * Port for shape geometry hit testing
 */
export interface ShapeHitTestPort {
  testShape(node: Node, shape: Shape, x: number, y: number): boolean
}

/**
 * Types of handles that can be hit
 */
export enum HandleType {
  CORNER = "CORNER",
  EDGE = "EDGE",
  ROTATION = "ROTATION",
}

/**
 * Result of handle hit testing
 */
export interface HandleHitResult {
  type: HandleType | null
  handle: string | null
}

/**
 * Port for handle hit testing
 * Implementations can use different strategies (Canvas API, manual geometry, etc.)
 */
export interface HandleHitTestPort {
  /**
   * Test if mouse position hits any handle
   * Returns the type and identifier of the hit handle, or null if no hit
   */
  testHandles(mouseX: number, mouseY: number): HandleHitResult

  /**
   * Store handle paths and transform context from rendering
   * Canvas-based implementations need this to perform hit testing
   */
  setHandleContext?(
    paths: HandlePaths,
    centerX: number,
    centerY: number,
    rotation: number,
  ): void

  /**
   * Clear any cached handle context
   */
  clearHandleContext(): void
}

/**
 * Helper functions for calculating centers
 * These are utility functions that don't depend on implementation
 */
export class HitTestHelper {
  /**
   * Get center position for a node + shape
   * Node provides position, shape provides dimensions
   */
  static getShapeCenter(node: Node, shape: Shape): { x: number; y: number } {
    if (shape.type === "LINE") {
      return {
        x: node.transform.x + (shape.geometry.x1 + shape.geometry.x2) / 2,
        y: node.transform.y + (shape.geometry.y1 + shape.geometry.y2) / 2,
      }
    }
    return {
      x: node.transform.x + shape.geometry.width / 2,
      y: node.transform.y + shape.geometry.height / 2,
    }
  }

  /**
   * Get center position for an AABB
   */
  static getAABBCenter(aabb: AABB): { x: number; y: number } {
    return {
      x: aabb.minX + (aabb.maxX - aabb.minX) / 2,
      y: aabb.minY + (aabb.maxY - aabb.minY) / 2,
    }
  }
}
