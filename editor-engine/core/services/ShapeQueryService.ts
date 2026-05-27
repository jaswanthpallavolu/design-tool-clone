// editor-engine/core/services/ShapeQueryService.ts
// Unified service for querying shapes with automatic fallback

import { Document } from "../Document"
import { ShapeNode, isShapeNode } from "../model/Node"
import { SpatialIndexService } from "./SpatialIndexService"
import { BoundingBoxService, AABB } from "./BoundingBoxService"
import { HitTestPort } from "../ports/HitTestPort"

/**
 * Unified service for querying shapes in the document.
 * Automatically uses spatial indexing when available, falls back to brute-force otherwise.
 *
 * This provides a clean abstraction that:
 * - Uses optimized spatial queries when spatial index is enabled
 * - Falls back to iterating all shapes when spatial index is disabled
 * - Maintains consistent API regardless of underlying implementation
 */
export class ShapeQueryService {
  constructor(
    private document: Document,
    private spatialIndex: SpatialIndexService,
  ) {}

  /**
   * Find the first shape at a given point using hit testing
   * @param x - X coordinate in world space
   * @param y - Y coordinate in world space
   * @param hitTestAdapter - Hit test adapter for precise shape testing
   * @param priorityNodeId - Optional node ID to check first (optimization for hover tracking)
   * @returns The shape node at the point, or undefined if none found
   */
  findShapeAtPoint(
    x: number,
    y: number,
    hitTestAdapter?: HitTestPort | null,
    priorityNodeId?: string,
  ): ShapeNode | undefined {
    if (!hitTestAdapter) {
      return undefined
    }

    // Fast path: check priority node first (currently hovered shape)
    // This avoids expensive spatial queries when mouse stays on the same shape
    // if (priorityNodeId) {
    //   const node = this.document.getNode(priorityNodeId)
    //   const shape = this.document.getShape(priorityNodeId)
    //   if (
    //     node &&
    //     shape &&
    //     isShapeNode(node) &&
    //     hitTestAdapter.testShape(node, shape, x, y)
    //   ) {
    //     return node
    //   }
    // }

    // Use spatial index if enabled (optimized path)
    if (this.spatialIndex.isEnabled()) {
      const candidates = this.spatialIndex.queryPoint(x, y)

      // Test candidates in reverse order (top to bottom in z-order)
      for (let i = candidates.length - 1; i >= 0; i--) {
        const candidate = candidates[i]
        const shape = this.document.getShape(candidate.id)
        if (shape && hitTestAdapter.testShape(candidate, shape, x, y)) {
          return candidate
        }
      }
      return undefined
    }

    // Fallback: brute-force search through all shapes
    const shapeNodes = this.document.getShapeNodes()

    // Search in reverse order (top to bottom in z-order)
    for (let i = shapeNodes.length - 1; i >= 0; i--) {
      const [node, shape] = shapeNodes[i]
      if (isShapeNode(node) && hitTestAdapter.testShape(node, shape, x, y)) {
        return node
      }
    }

    return undefined
  }

  /**
   * Find all shapes that intersect with a rectangular region
   * @param minX - Minimum X coordinate
   * @param minY - Minimum Y coordinate
   * @param maxX - Maximum X coordinate
   * @param maxY - Maximum Y coordinate
   * @returns Array of shape nodes that intersect the region
   */
  findShapesInRegion(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): ShapeNode[] {
    const marquee: AABB = { minX, minY, maxX, maxY }
    const results: ShapeNode[] = []

    // Use spatial index if enabled (optimized path)
    if (this.spatialIndex.isEnabled()) {
      const candidates = this.spatialIndex.queryRegion(minX, minY, maxX, maxY)

      for (const candidate of candidates) {
        const shape = this.document.getShape(candidate.id)
        if (!shape) continue

        const intersects =
          shape.type === "LINE"
            ? BoundingBoxService.lineIntersectsAABB(
                candidate.transform.x + shape.geometry.x1,
                candidate.transform.y + shape.geometry.y1,
                candidate.transform.x + shape.geometry.x2,
                candidate.transform.y + shape.geometry.y2,
                marquee,
              )
            : BoundingBoxService.aabbIntersects(
                marquee,
                BoundingBoxService.getAABB(candidate, shape),
              )

        if (intersects) {
          results.push(candidate)
        }
      }

      return results
    }

    // Fallback: brute-force search through all shapes
    const shapeNodes = this.document.getShapeNodes()

    for (const [node, shape] of shapeNodes) {
      if (!isShapeNode(node)) continue

      const intersects =
        shape.type === "LINE"
          ? BoundingBoxService.lineIntersectsAABB(
              node.transform.x + shape.geometry.x1,
              node.transform.y + shape.geometry.y1,
              node.transform.x + shape.geometry.x2,
              node.transform.y + shape.geometry.y2,
              marquee,
            )
          : BoundingBoxService.aabbIntersects(
              marquee,
              BoundingBoxService.getAABB(node, shape),
            )

      if (intersects) {
        results.push(node)
      }
    }

    return results
  }

  /**
   * Find all shapes within a circular region
   * @param centerX - Center X coordinate
   * @param centerY - Center Y coordinate
   * @param radius - Radius of the circle
   * @returns Array of shape nodes within the circle
   */
  findShapesInCircle(
    centerX: number,
    centerY: number,
    radius: number,
  ): ShapeNode[] {
    // Use spatial index if enabled (optimized path)
    if (this.spatialIndex.isEnabled()) {
      return this.spatialIndex.queryCircle(centerX, centerY, radius)
    }

    // Fallback: brute-force search through all shapes
    const results: ShapeNode[] = []
    const shapeNodes = this.document.getShapeNodes()
    const radiusSquared = radius * radius

    for (const [node, shape] of shapeNodes) {
      if (!isShapeNode(node)) continue

      const aabb = BoundingBoxService.getAABB(node, shape)
      const closestX = Math.max(aabb.minX, Math.min(centerX, aabb.maxX))
      const closestY = Math.max(aabb.minY, Math.min(centerY, aabb.maxY))
      const distanceSquared =
        (closestX - centerX) ** 2 + (closestY - centerY) ** 2

      if (distanceSquared <= radiusSquared) {
        results.push(node)
      }
    }

    return results
  }

  /**
   * Check if spatial indexing is currently enabled
   */
  isSpatialIndexEnabled(): boolean {
    return this.spatialIndex.isEnabled()
  }

  /**
   * Get statistics about the current query strategy
   */
  getQueryStats(): {
    usingSpatialIndex: boolean
    totalShapes: number
    spatialIndexStats?: ReturnType<SpatialIndexService["getStats"]>
  } {
    const totalShapes = this.document.getShapeNodes().length
    const usingSpatialIndex = this.spatialIndex.isEnabled()

    return {
      usingSpatialIndex,
      totalShapes,
      spatialIndexStats: usingSpatialIndex
        ? this.spatialIndex.getStats()
        : undefined,
    }
  }
}

// Made with Bob
