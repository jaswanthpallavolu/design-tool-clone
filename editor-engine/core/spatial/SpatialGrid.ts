// editor-engine/core/spatial/SpatialGrid.ts
// World-space Uniform Grid for efficient spatial queries

import type { AABB } from "../services/BoundingBoxService"

/**
 * Represents a cell in the spatial grid
 */
interface GridCell {
  nodeIds: Set<string>
}

/**
 * Configuration for the spatial grid
 */
export interface SpatialGridConfig {
  /** Size of each grid cell in world units */
  cellSize: number
  /** Initial bounds of the grid (can grow dynamically) */
  initialBounds?: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}

/**
 * Function type for providing bounding boxes for nodes
 * Returns null if the node doesn't exist or has no bounds
 */
export type BoundingBoxProvider = (nodeId: string) => AABB | null

/**
 * Query result containing node IDs and their bounding boxes
 */
export interface SpatialQueryResult {
  nodeId: string
  bounds: AABB
}

/**
 * World-space Uniform Grid for spatial partitioning
 *
 * This data structure divides 2D space into a grid of uniform cells.
 * Each cell tracks which nodes overlap it, enabling efficient spatial queries.
 *
 * Architecture:
 * - Decoupled from specific node/shape types via callback pattern
 * - Caller provides a BoundingBoxProvider function to compute bounds
 * - Enables caching, lazy evaluation, and flexible data structures
 *
 * Use cases:
 * - Fast hit testing (find shapes at a point)
 * - Region queries (find all shapes in an area)
 * - Collision detection
 * - Frustum culling
 *
 * The grid dynamically expands as objects are added outside current bounds.
 */
export class SpatialGrid {
  private cellSize: number
  private cells: Map<string, GridCell> = new Map()
  private nodeToKeys: Map<string, Set<string>> = new Map()
  private getBounds: BoundingBoxProvider

  // Track grid bounds for dynamic expansion
  private minX: number = 0
  private minY: number = 0
  private maxX: number = 0
  private maxY: number = 0

  constructor(config: SpatialGridConfig, getBounds: BoundingBoxProvider) {
    this.cellSize = config.cellSize
    this.getBounds = getBounds

    if (config.initialBounds) {
      this.minX = config.initialBounds.minX
      this.minY = config.initialBounds.minY
      this.maxX = config.initialBounds.maxX
      this.maxY = config.initialBounds.maxY
    }
  }

  /**
   * Generate a unique key for a grid cell
   */
  private getCellKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`
  }

  /**
   * Convert world coordinates to grid cell coordinates
   */
  private worldToCell(x: number, y: number): { cellX: number; cellY: number } {
    return {
      cellX: Math.floor(x / this.cellSize),
      cellY: Math.floor(y / this.cellSize),
    }
  }

  /**
   * Get or create a cell at the given grid coordinates
   */
  private getOrCreateCell(cellX: number, cellY: number): GridCell {
    const key = this.getCellKey(cellX, cellY)
    let cell = this.cells.get(key)

    if (!cell) {
      cell = { nodeIds: new Set() }
      this.cells.set(key, cell)
    }

    return cell
  }

  /**
   * Get all grid cells that overlap with the given AABB
   */
  private getCellsForAABB(aabb: AABB): Array<{ cellX: number; cellY: number }> {
    const minCell = this.worldToCell(aabb.minX, aabb.minY)
    const maxCell = this.worldToCell(aabb.maxX, aabb.maxY)

    const cells: Array<{ cellX: number; cellY: number }> = []

    for (let x = minCell.cellX; x <= maxCell.cellX; x++) {
      for (let y = minCell.cellY; y <= maxCell.cellY; y++) {
        cells.push({ cellX: x, cellY: y })
      }
    }

    return cells
  }

  /**
   * Insert a node into the spatial grid
   * The node will be added to all cells its bounding box overlaps
   */
  insert(nodeId: string): void {
    // Get bounding box from provider
    const aabb = this.getBounds(nodeId)
    if (!aabb) {
      return // Node doesn't exist or has no bounds
    }

    // Update grid bounds
    this.minX = Math.min(this.minX, aabb.minX)
    this.minY = Math.min(this.minY, aabb.minY)
    this.maxX = Math.max(this.maxX, aabb.maxX)
    this.maxY = Math.max(this.maxY, aabb.maxY)

    // Get all cells this node overlaps
    const cells = this.getCellsForAABB(aabb)
    const cellKeys = new Set<string>()

    // Add node to each overlapping cell
    for (const { cellX, cellY } of cells) {
      const cell = this.getOrCreateCell(cellX, cellY)
      cell.nodeIds.add(nodeId)
      cellKeys.add(this.getCellKey(cellX, cellY))
    }

    // Track which cells contain this node for efficient removal/updates
    this.nodeToKeys.set(nodeId, cellKeys)
  }

  /**
   * Remove a node from the spatial grid
   */
  remove(nodeId: string): void {
    const cellKeys = this.nodeToKeys.get(nodeId)

    if (!cellKeys) {
      return
    }

    // Remove node from all cells it was in
    for (const key of cellKeys) {
      const cell = this.cells.get(key)
      if (cell) {
        cell.nodeIds.delete(nodeId)

        // Clean up empty cells to save memory
        if (cell.nodeIds.size === 0) {
          this.cells.delete(key)
        }
      }
    }

    this.nodeToKeys.delete(nodeId)
  }

  /**
   * Update a node's position in the grid
   * More efficient than remove + insert as it only updates changed cells
   */
  update(nodeId: string): void {
    // For simplicity, we remove and re-insert
    // A more optimized version would only update cells that changed
    this.remove(nodeId)
    this.insert(nodeId)
  }

  /**
   * Query all nodes at a specific point in world space
   * Returns nodes whose bounding boxes contain the point
   */
  queryPoint(x: number, y: number): SpatialQueryResult[] {
    const { cellX, cellY } = this.worldToCell(x, y)
    const cell = this.cells.get(this.getCellKey(cellX, cellY))

    if (!cell) {
      return []
    }

    const results: SpatialQueryResult[] = []

    // Check each node in the cell
    for (const nodeId of cell.nodeIds) {
      const aabb = this.getBounds(nodeId)
      if (!aabb) continue

      // Verify point is actually inside the AABB
      if (
        x >= aabb.minX &&
        x <= aabb.maxX &&
        y >= aabb.minY &&
        y <= aabb.maxY
      ) {
        results.push({ nodeId, bounds: aabb })
      }
    }

    return results
  }

  /**
   * Query all nodes that overlap with a rectangular region
   * Returns nodes whose bounding boxes intersect the query region
   */
  queryRegion(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): SpatialQueryResult[] {
    const queryAABB: AABB = { minX, minY, maxX, maxY }
    const cells = this.getCellsForAABB(queryAABB)

    // Use a set to avoid duplicate nodes (nodes can span multiple cells)
    const candidateNodeIds = new Set<string>()

    for (const { cellX, cellY } of cells) {
      const cell = this.cells.get(this.getCellKey(cellX, cellY))
      if (cell) {
        for (const nodeId of cell.nodeIds) {
          candidateNodeIds.add(nodeId)
        }
      }
    }

    const results: SpatialQueryResult[] = []

    // Check each candidate node for actual intersection
    for (const nodeId of candidateNodeIds) {
      const aabb = this.getBounds(nodeId)
      if (!aabb) continue

      // Check if AABBs intersect
      if (this.aabbIntersects(aabb, queryAABB)) {
        results.push({ nodeId, bounds: aabb })
      }
    }

    return results
  }

  /**
   * Query all nodes within a circular region
   */
  queryCircle(
    centerX: number,
    centerY: number,
    radius: number,
  ): SpatialQueryResult[] {
    // Query a square region that contains the circle
    const queryAABB: AABB = {
      minX: centerX - radius,
      minY: centerY - radius,
      maxX: centerX + radius,
      maxY: centerY + radius,
    }

    const cells = this.getCellsForAABB(queryAABB)
    const candidateNodeIds = new Set<string>()

    for (const { cellX, cellY } of cells) {
      const cell = this.cells.get(this.getCellKey(cellX, cellY))
      if (cell) {
        for (const nodeId of cell.nodeIds) {
          candidateNodeIds.add(nodeId)
        }
      }
    }

    const results: SpatialQueryResult[] = []
    const radiusSquared = radius * radius

    for (const nodeId of candidateNodeIds) {
      const aabb = this.getBounds(nodeId)
      if (!aabb) continue

      // Check if AABB intersects with circle
      // Find closest point on AABB to circle center
      const closestX = Math.max(aabb.minX, Math.min(centerX, aabb.maxX))
      const closestY = Math.max(aabb.minY, Math.min(centerY, aabb.maxY))

      const dx = closestX - centerX
      const dy = closestY - centerY
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared <= radiusSquared) {
        results.push({ nodeId, bounds: aabb })
      }
    }

    return results
  }

  /**
   * Get all nodes in the grid
   */
  getAllNodes(): SpatialQueryResult[] {
    const results: SpatialQueryResult[] = []
    const processedIds = new Set<string>()

    for (const cell of this.cells.values()) {
      for (const nodeId of cell.nodeIds) {
        if (processedIds.has(nodeId)) continue
        processedIds.add(nodeId)

        const aabb = this.getBounds(nodeId)
        if (aabb) {
          results.push({ nodeId, bounds: aabb })
        }
      }
    }

    return results
  }

  /**
   * Check if a node exists in the grid
   */
  has(nodeId: string): boolean {
    return this.nodeToKeys.has(nodeId)
  }

  /**
   * Get the number of nodes in the grid
   */
  size(): number {
    return this.nodeToKeys.size
  }

  /**
   * Clear all nodes from the grid
   */
  clear(): void {
    this.cells.clear()
    this.nodeToKeys.clear()
  }

  /**
   * Check if two AABBs intersect
   */
  private aabbIntersects(a: AABB, b: AABB): boolean {
    return !(
      a.maxX < b.minX ||
      a.minX > b.maxX ||
      a.maxY < b.minY ||
      a.minY > b.maxY
    )
  }

  /**
   * Get statistics about the grid
   */
  getStats(): {
    cellCount: number
    nodeCount: number
    averageNodesPerCell: number
    cellSize: number
    bounds: { minX: number; minY: number; maxX: number; maxY: number }
  } {
    let totalNodes = 0
    for (const cell of this.cells.values()) {
      totalNodes += cell.nodeIds.size
    }

    return {
      cellCount: this.cells.size,
      nodeCount: this.nodeToKeys.size,
      averageNodesPerCell:
        this.cells.size > 0 ? totalNodes / this.cells.size : 0,
      cellSize: this.cellSize,
      bounds: {
        minX: this.minX,
        minY: this.minY,
        maxX: this.maxX,
        maxY: this.maxY,
      },
    }
  }

  /**
   * Rebuild the entire grid from a collection of node IDs
   * Useful after bulk operations or when grid becomes fragmented
   */
  rebuild(nodeIds: string[]): void {
    this.clear()

    for (const nodeId of nodeIds) {
      this.insert(nodeId)
    }
  }

  /**
   * Get the cell size
   */
  getCellSize(): number {
    return this.cellSize
  }

  /**
   * Update the cell size and rebuild the grid
   * Warning: This is an expensive operation
   */
  setCellSize(cellSize: number, nodeIds: string[]): void {
    this.cellSize = cellSize
    this.rebuild(nodeIds)
  }
}

// Made with Bob
