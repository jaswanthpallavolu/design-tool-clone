import { HandleGeometry } from "./HandleGeometryService"
import { Shape } from "../model/Shape"
import { AABB } from "./BoundingBoxService"

export interface HandleHitResult {
  type: "corner" | "edge" | "rotation" | null
  handle: string | null
}

export class HandleHitTestService {
  /**
   * Test if mouse position hits any handle
   * Mouse coordinates should be in world space
   */
  static testHandles(
    mouseX: number,
    mouseY: number,
    geometry: HandleGeometry,
    centerX: number,
    centerY: number,
    rotation: number = 0,
  ): HandleHitResult {
    // Transform mouse to local space (relative to shape center)
    const localMouse = this.worldToLocal(
      mouseX,
      mouseY,
      centerX,
      centerY,
      rotation,
    )

    // Test rotation handles first (highest priority, outermost)
    for (const [key, handle] of Object.entries(geometry.rotation)) {
      if (this.isPointInCircle(localMouse.x, localMouse.y, handle)) {
        return { type: "rotation", handle: key }
      }
    }

    // Test corner handles (resize diagonally)
    for (const [key, handle] of Object.entries(geometry.corners)) {
      if (this.isPointInRect(localMouse.x, localMouse.y, handle)) {
        return { type: "corner", handle: key }
      }
    }

    // Test edge handles (resize single axis)
    for (const [key, edge] of Object.entries(geometry.edges)) {
      if (this.isPointNearLine(localMouse.x, localMouse.y, edge)) {
        return { type: "edge", handle: key }
      }
    }

    return { type: null, handle: null }
  }

  /**
   * Transform world coordinates to local space
   */
  private static worldToLocal(
    worldX: number,
    worldY: number,
    centerX: number,
    centerY: number,
    rotation: number,
  ): { x: number; y: number } {
    // Translate to origin
    const tx = worldX - centerX
    const ty = worldY - centerY

    // Rotate back (inverse rotation)
    const cos = Math.cos(-rotation)
    const sin = Math.sin(-rotation)

    return {
      x: tx * cos - ty * sin,
      y: tx * sin + ty * cos,
    }
  }

  /**
   * Check if point is inside a circle
   */
  private static isPointInCircle(
    x: number,
    y: number,
    circle: { x: number; y: number; radius: number },
  ): boolean {
    const dx = x - circle.x
    const dy = y - circle.y
    return dx * dx + dy * dy <= circle.radius * circle.radius
  }

  /**
   * Check if point is inside a rectangle (corner handle)
   */
  private static isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; size: number },
  ): boolean {
    const halfSize = rect.size / 2
    return (
      x >= rect.x - halfSize &&
      x <= rect.x + halfSize &&
      y >= rect.y - halfSize &&
      y <= rect.y + halfSize
    )
  }

  /**
   * Check if point is near a line (edge handle)
   */
  private static isPointNearLine(
    x: number,
    y: number,
    line: { x1: number; y1: number; x2: number; y2: number },
    threshold: number = 5,
  ): boolean {
    // Calculate distance from point to line segment
    const dx = line.x2 - line.x1
    const dy = line.y2 - line.y1
    const lengthSquared = dx * dx + dy * dy

    if (lengthSquared === 0) {
      // Line is a point
      const dist = Math.sqrt((x - line.x1) ** 2 + (y - line.y1) ** 2)
      return dist <= threshold
    }

    // Calculate projection of point onto line
    let t = ((x - line.x1) * dx + (y - line.y1) * dy) / lengthSquared
    t = Math.max(0, Math.min(1, t))

    // Find closest point on line segment
    const closestX = line.x1 + t * dx
    const closestY = line.y1 + t * dy

    // Calculate distance
    const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2)
    return distance <= threshold
  }

  /**
   * Get center position for a shape
   * Top-left based: calculate center from transform.x/y + dimensions
   */
  static getShapeCenter(shape: Shape): { x: number; y: number } {
    if (shape.kind === "line") {
      return {
        x: shape.transform.x + (shape.local.x1 + shape.local.x2) / 2,
        y: shape.transform.y + (shape.local.y1 + shape.local.y2) / 2,
      }
    }
    return {
      x: shape.transform.x + shape.local.width / 2,
      y: shape.transform.y + shape.local.height / 2,
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

// Made with Bob
