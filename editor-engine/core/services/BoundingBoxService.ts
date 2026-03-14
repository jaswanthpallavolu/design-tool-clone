import { Shape, RectangleShape, EllipseShape, LineShape } from "../model/Shape"

export interface AABB {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export class BoundingBoxService {
  static getAABB(shape: Shape): AABB {
    return shape.kind === "line"
      ? this.getAABBForLine(shape)
      : this.getAABBForRectangle(shape)
  }

  /**
   * Calculate AABB for rectangle or ellipse shapes
   * Handles rotation by computing the bounding box of all rotated corners
   * Top-left based: calculate center from transform.x/y + dimensions
   */
  private static getAABBForRectangle(
    shape: RectangleShape | EllipseShape,
  ): AABB {
    const hw = shape.local.width / 2
    const hh = shape.local.height / 2

    // Top-left based: calculate center
    const cx = shape.transform.x + hw
    const cy = shape.transform.y + hh

    const cos = Math.cos(shape.transform.rotation)
    const sin = Math.sin(shape.transform.rotation)

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
   * Top-left based: transform.x/y + local coords
   */
  private static getAABBForLine(shape: LineShape): AABB {
    // Top-left based: add local coords to transform position
    const x1 = shape.transform.x + shape.local.x1
    const y1 = shape.transform.y + shape.local.y1
    const x2 = shape.transform.x + shape.local.x2
    const y2 = shape.transform.y + shape.local.y2

    let minX = Math.min(x1, x2)
    let minY = Math.min(y1, y2)
    let maxX = Math.max(x1, x2)
    let maxY = Math.max(y1, y2)

    // Add padding for stroke width
    if (shape.lineWidth > 0) {
      const pad = shape.lineWidth / 2
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
}
