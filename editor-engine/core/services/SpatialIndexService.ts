// editor-engine/core/services/SpatialIndexService.ts
// Service for managing spatial indexing of shapes in the document

import { Document } from "../Document"
import {
  SpatialGrid,
  SpatialGridConfig,
  BoundingBoxProvider,
} from "../spatial/SpatialGrid"
import { BoundingBoxService, AABB } from "./BoundingBoxService"
import { ShapeNode, isShapeNode } from "../model/Node"
import { EventBus } from "../EventBus"

/**
 * Configuration for the spatial index service
 */
export interface SpatialIndexConfig {
  /** Size of each grid cell in world units (default: 100) */
  cellSize?: number
  /** Initial bounds of the grid */
  initialBounds?: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  /** Whether to automatically sync with document changes (default: true) */
  autoSync?: boolean
}

/**
 * Service for managing spatial indexing of shapes in the document
 *
 * This service provides an optional spatial index (uniform grid) for fast spatial queries.
 * It can be enabled/disabled at runtime and automatically syncs with document changes.
 *
 * Benefits:
 * - Fast hit testing (find shapes at a point)
 * - Efficient region queries (find shapes in an area)
 * - Optional - doesn't affect core editor if not used
 * - Loose coupling - can be disabled without breaking functionality
 *
 * Usage:
 * ```typescript
 * // Enable spatial indexing
 * editor.spatialIndex.enable({ cellSize: 100 })
 *
 * // Query shapes at a point
 * const shapes = editor.spatialIndex.queryPoint(x, y)
 *
 * // Disable when not needed
 * editor.spatialIndex.disable()
 * ```
 */
export class SpatialIndexService {
  private grid?: SpatialGrid
  private autoSync: boolean = true
  private unsubscribers: Array<() => void> = []

  constructor(
    private document: Document,
    private events?: EventBus,
  ) {}

  /**
   * Check if spatial indexing is enabled
   */
  isEnabled(): boolean {
    return this.grid !== undefined
  }

  /**
   * Enable spatial indexing with the given configuration
   * If already enabled, this will rebuild the index with new settings
   */
  enable(config: SpatialIndexConfig = {}): void {
    const cellSize = config.cellSize ?? 100
    this.autoSync = config.autoSync ?? true

    // Create bounding box provider
    const getBounds: BoundingBoxProvider = (nodeId: string) => {
      const node = this.document.getNode(nodeId)
      const shape = this.document.getShape(nodeId)
      if (!node || !shape || !isShapeNode(node)) {
        return null
      }
      return BoundingBoxService.getAABB(node, shape)
    }

    // Create spatial grid
    const gridConfig: SpatialGridConfig = {
      cellSize,
      initialBounds: config.initialBounds,
    }

    this.grid = new SpatialGrid(gridConfig, getBounds)

    // Build initial index from existing shapes
    this.rebuild()

    // Set up auto-sync if enabled
    if (this.autoSync && this.events) {
      this.setupAutoSync()
    }

    // Emit event
    this.events?.emit("spatialIndex:enabled", { cellSize })
  }

  /**
   * Disable spatial indexing and clean up resources
   */
  disable(): void {
    if (!this.grid) return

    // Clean up event listeners
    this.unsubscribers.forEach((unsub) => unsub())
    this.unsubscribers = []

    // Clear grid
    this.grid.clear()
    this.grid = undefined

    // Emit event
    this.events?.emit("spatialIndex:disabled")
  }

  /**
   * Rebuild the entire spatial index from current document state
   * Useful after bulk operations or when index becomes stale
   */
  rebuild(): void {
    if (!this.grid) return

    // Get all shape node IDs
    const nodeIds: string[] = []
    for (const node of this.document.getAllNodes()) {
      if (isShapeNode(node)) {
        nodeIds.push(node.id)
      }
    }

    // Rebuild grid
    this.grid.rebuild(nodeIds)

    // Emit event
    this.events?.emit("spatialIndex:rebuilt", { nodeCount: nodeIds.length })
  }

  /**
   * Manually update a node in the spatial index
   * Only needed if autoSync is disabled
   */
  updateNode(nodeId: string): void {
    if (!this.grid) return
    this.grid.update(nodeId)
  }

  /**
   * Manually insert a node into the spatial index
   * Only needed if autoSync is disabled
   */
  insertNode(nodeId: string): void {
    if (!this.grid) return
    this.grid.insert(nodeId)
  }

  /**
   * Manually remove a node from the spatial index
   * Only needed if autoSync is disabled
   */
  removeNode(nodeId: string): void {
    if (!this.grid) return
    this.grid.remove(nodeId)
  }

  /**
   * Query all shape nodes at a specific point in world space
   * Returns empty array if spatial indexing is disabled
   */
  queryPoint(x: number, y: number): ShapeNode[] {
    if (!this.grid) return []

    const results = this.grid.queryPoint(x, y)
    const nodes: ShapeNode[] = []

    for (const { nodeId } of results) {
      const node = this.document.getNode(nodeId)
      if (node && isShapeNode(node)) {
        nodes.push(node)
      }
    }

    return nodes
  }

  /**
   * Query all shape nodes in a rectangular region
   * Returns empty array if spatial indexing is disabled
   */
  queryRegion(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): ShapeNode[] {
    if (!this.grid) return []

    const results = this.grid.queryRegion(minX, minY, maxX, maxY)
    const nodes: ShapeNode[] = []

    for (const { nodeId } of results) {
      const node = this.document.getNode(nodeId)
      if (node && isShapeNode(node)) {
        nodes.push(node)
      }
    }

    return nodes
  }

  /**
   * Query all shape nodes within a circular region
   * Returns empty array if spatial indexing is disabled
   */
  queryCircle(centerX: number, centerY: number, radius: number): ShapeNode[] {
    if (!this.grid) return []

    const results = this.grid.queryCircle(centerX, centerY, radius)
    const nodes: ShapeNode[] = []

    for (const { nodeId } of results) {
      const node = this.document.getNode(nodeId)
      if (node && isShapeNode(node)) {
        nodes.push(node)
      }
    }

    return nodes
  }

  /**
   * Query all shape nodes with their bounding boxes at a point
   * Useful when you need both the node and its bounds
   */
  queryPointWithBounds(
    x: number,
    y: number,
  ): Array<{ node: ShapeNode; bounds: AABB }> {
    if (!this.grid) return []

    const results = this.grid.queryPoint(x, y)
    const output: Array<{ node: ShapeNode; bounds: AABB }> = []

    for (const { nodeId, bounds } of results) {
      const node = this.document.getNode(nodeId)
      if (node && isShapeNode(node)) {
        output.push({ node, bounds })
      }
    }

    return output
  }

  /**
   * Get statistics about the spatial index
   * Returns null if spatial indexing is disabled
   */
  getStats(): {
    cellCount: number
    nodeCount: number
    averageNodesPerCell: number
    cellSize: number
    bounds: { minX: number; minY: number; maxX: number; maxY: number }
  } | null {
    if (!this.grid) return null
    return this.grid.getStats()
  }

  /**
   * Change the cell size and rebuild the index
   * Warning: This is an expensive operation
   */
  setCellSize(cellSize: number): void {
    if (!this.grid) return

    const nodeIds: string[] = []
    for (const node of this.document.getAllNodes()) {
      if (isShapeNode(node)) {
        nodeIds.push(node.id)
      }
    }

    this.grid.setCellSize(cellSize, nodeIds)

    // Emit event
    this.events?.emit("spatialIndex:cellSizeChanged", { cellSize })
  }

  /**
   * Set up automatic synchronization with document changes
   * This listens to document events and updates the spatial index accordingly
   */
  private setupAutoSync(): void {
    if (!this.events) return

    // Listen for node additions
    const unsubAdd = this.events.on("document:nodeAdded", (data: unknown) => {
      const eventData = data as { nodeId?: string }
      if (eventData?.nodeId && this.grid) {
        const node = this.document.getNode(eventData.nodeId)
        if (node && isShapeNode(node)) {
          this.grid.insert(eventData.nodeId)
        }
      }
    })

    // Listen for node removals
    const unsubRemove = this.events.on(
      "document:nodeRemoved",
      (data: unknown) => {
        const eventData = data as { nodeId?: string }
        if (eventData?.nodeId && this.grid) {
          this.grid.remove(eventData.nodeId)
        }
      },
    )

    // Listen for node updates (position/rotation changes)
    const unsubUpdate = this.events.on(
      "document:nodeUpdated",
      (data: unknown) => {
        const eventData = data as { nodeId?: string }
        if (eventData?.nodeId && this.grid) {
          const node = this.document.getNode(eventData.nodeId)
          if (node && isShapeNode(node)) {
            this.grid.update(eventData.nodeId)
          }
        }
      },
    )

    // Listen for shape updates (geometry changes)
    const unsubShapeUpdate = this.events.on(
      "document:shapeUpdated",
      (data: unknown) => {
        const eventData = data as { nodeId?: string }
        if (eventData?.nodeId && this.grid) {
          this.grid.update(eventData.nodeId)
        }
      },
    )

    // Listen for document clear
    const unsubClear = this.events.on("document:cleared", () => {
      if (this.grid) {
        this.grid.clear()
      }
    })

    // Store unsubscribers for cleanup
    this.unsubscribers.push(
      unsubAdd,
      unsubRemove,
      unsubUpdate,
      unsubShapeUpdate,
      unsubClear,
    )
  }
}

// Made with Bob
