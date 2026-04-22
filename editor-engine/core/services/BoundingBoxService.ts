import { Shape, RectangleShape, EllipseShape, LineShape } from "../model/Shape"
import { Node } from "../model/Node"

export interface AABB {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Oriented Bounding Box - a rotated bounding box
 * Defined by center position, dimensions, and rotation
 */
export interface OBB {
  centerX: number
  centerY: number
  width: number
  height: number
  rotation: number // in radians
}

export class BoundingBoxService {
  /**
   * Calculate AABB for a node + shape pair
   * Node provides transform (position, rotation), shape provides geometry
   */
  static getAABB(node: Node, shape: Shape): AABB {
    return shape.type === "LINE"
      ? this.getAABBForLine(node, shape)
      : this.getAABBForRectangle(node, shape)
  }

  /**
   * Calculate AABB for rectangle or ellipse shapes
   * Handles rotation by computing the bounding box of all rotated corners
   */
  private static getAABBForRectangle(
    node: Node,
    shape: RectangleShape | EllipseShape,
  ): AABB {
    const hw = shape.geometry.width / 2
    const hh = shape.geometry.height / 2

    // Calculate center from node position + half dimensions
    const cx = node.transform.x + hw
    const cy = node.transform.y + hh

    const cos = Math.cos(node.transform.rotation)
    const sin = Math.sin(node.transform.rotation)

    // Define corners relative to center
    const corners = [
      { x: -hw, y: -hh }, // Top-left
      { x: hw, y: -hh }, // Top-right
      { x: hw, y: hh }, // Bottom-right
      { x: -hw, y: hh }, // Bottom-left
    ]

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    // Rotate each corner and find min/max bounds
    for (const p of corners) {
      const x = p.x * cos - p.y * sin + cx
      const y = p.x * sin + p.y * cos + cy

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    return { minX, minY, maxX, maxY }
  }

  /**
   * Calculate AABB for line shapes
   * Includes stroke width padding
   */
  private static getAABBForLine(node: Node, shape: LineShape): AABB {
    // Add local line coords to node position
    const x1 = node.transform.x + shape.geometry.x1
    const y1 = node.transform.y + shape.geometry.y1
    const x2 = node.transform.x + shape.geometry.x2
    const y2 = node.transform.y + shape.geometry.y2

    let minX = Math.min(x1, x2)
    let minY = Math.min(y1, y2)
    let maxX = Math.max(x1, x2)
    let maxY = Math.max(y1, y2)

    // Add padding for stroke width
    if (shape.geometry.lineWidth > 0) {
      const pad = shape.geometry.lineWidth / 2
      minX -= pad
      minY -= pad
      maxX += pad
      maxY += pad
    }

    return { minX, minY, maxX, maxY }
  }

  /**
   * Compute union of multiple AABBs
   */
  static unionAABBs(aabbs: AABB[]): AABB {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const b of aabbs) {
      minX = Math.min(minX, b.minX)
      minY = Math.min(minY, b.minY)
      maxX = Math.max(maxX, b.maxX)
      maxY = Math.max(maxY, b.maxY)
    }

    return { minX, minY, maxX, maxY }
  }

  /**
   * Check if two AABBs intersect
   */
  static aabbIntersects(a: AABB, b: AABB): boolean {
    return !(
      a.maxX < b.minX ||
      a.minX > b.maxX ||
      a.maxY < b.minY ||
      a.minY > b.maxY
    )
  }

  /**
   * Check if a line segment intersects an AABB using Liang-Barsky algorithm
   * @see https://www.geeksforgeeks.org/computer-graphics/liang-barsky-algorithm/
   */
  static lineIntersectsAABB(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    box: AABB,
  ): boolean {
    let t0 = 0
    let t1 = 1

    const dx = x2 - x1
    const dy = y2 - y1

    function clip(p: number, q: number): boolean {
      if (p === 0) {
        return q >= 0
      }

      const r = q / p

      if (p < 0) {
        if (r > t1) return false
        if (r > t0) t0 = r
      } else {
        if (r < t0) return false
        if (r < t1) t1 = r
      }

      return true
    }

    if (!clip(-dx, x1 - box.minX)) return false
    if (!clip(dx, box.maxX - x1)) return false
    if (!clip(-dy, y1 - box.minY)) return false
    if (!clip(dy, box.maxY - y1)) return false

    return t0 <= t1
  }

  /**
   * Convert AABB to OBB (axis-aligned box with rotation = 0)
   */
  static aabbToOBB(aabb: AABB): OBB {
    const width = aabb.maxX - aabb.minX
    const height = aabb.maxY - aabb.minY
    return {
      centerX: aabb.minX + width / 2,
      centerY: aabb.minY + height / 2,
      width,
      height,
      rotation: 0,
    }
  }

  /**
   * Convert OBB to AABB (compute axis-aligned bounds of rotated box)
   */
  static obbToAABB(obb: OBB): AABB {
    const hw = obb.width / 2
    const hh = obb.height / 2
    const cos = Math.cos(obb.rotation)
    const sin = Math.sin(obb.rotation)

    // Define corners relative to center
    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
    ]

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    // Rotate each corner and find min/max bounds
    for (const p of corners) {
      const x = p.x * cos - p.y * sin + obb.centerX
      const y = p.x * sin + p.y * cos + obb.centerY

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    return { minX, minY, maxX, maxY }
  }

  /**
   * Check if bounds is an OBB (has centerX property)
   */
  static isOBB(bounds: AABB | OBB): bounds is OBB {
    return "centerX" in bounds
  }

  /**
   * Get center point from either AABB or OBB
   */
  static getCenter(bounds: AABB | OBB): { x: number; y: number } {
    if (this.isOBB(bounds)) {
      return { x: bounds.centerX, y: bounds.centerY }
    }
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY
    return {
      x: bounds.minX + width / 2,
      y: bounds.minY + height / 2,
    }
  }

  /**
   * Get rotation from bounds (0 for AABB, actual rotation for OBB)
   */
  static getRotation(bounds: AABB | OBB): number {
    return this.isOBB(bounds) ? bounds.rotation : 0
  }
}
