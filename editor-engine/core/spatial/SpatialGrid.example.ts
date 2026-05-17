// editor-engine/core/spatial/SpatialGrid.example.ts
// Example usage of the SpatialGrid for spatial queries

import {
  SpatialGrid,
  SpatialGridConfig,
  BoundingBoxProvider,
} from "./SpatialGrid"
import { createShapeNode, ShapeNode } from "../model/Node"
import { createRectangleShape, Shape } from "../model/Shape"
import { BoundingBoxService } from "../services/BoundingBoxService"

/**
 * Example 1: Basic Setup and Insertion
 */
function example1_BasicUsage() {
  console.log("=== Example 1: Basic Usage ===")

  // Create storage for nodes and shapes
  const shapes = new Map<string, Shape>()
  const nodes = new Map<string, ShapeNode>()

  // Create a bounding box provider function
  const getBounds: BoundingBoxProvider = (nodeId: string) => {
    const node = nodes.get(nodeId)
    const shape = shapes.get(nodeId)
    if (!node || !shape) return null
    return BoundingBoxService.getAABB(node, shape)
  }

  // Create a spatial grid with 100-unit cells
  const config: SpatialGridConfig = {
    cellSize: 100,
    initialBounds: {
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 1000,
    },
  }

  const grid = new SpatialGrid(config, getBounds)

  // Shape 1: Rectangle at (50, 50)
  const node1 = createShapeNode("node1", { x: 50, y: 50, rotation: 0 })
  const shape1 = createRectangleShape(
    "node1",
    { width: 100, height: 100 },
    { fillColor: "#ff0000", strokeColor: "#000000" },
  )
  nodes.set(node1.id, node1)
  shapes.set(node1.id, shape1)
  grid.insert(node1.id)

  // Shape 2: Rectangle at (200, 200)
  const node2 = createShapeNode("node2", { x: 200, y: 200, rotation: 0 })
  const shape2 = createRectangleShape(
    "node2",
    { width: 80, height: 80 },
    { fillColor: "#00ff00", strokeColor: "#000000" },
  )
  nodes.set(node2.id, node2)
  shapes.set(node2.id, shape2)
  grid.insert(node2.id)

  // Shape 3: Rectangle at (500, 500)
  const node3 = createShapeNode("node3", { x: 500, y: 500, rotation: 0 })
  const shape3 = createRectangleShape(
    "node3",
    { width: 150, height: 150 },
    { fillColor: "#0000ff", strokeColor: "#000000" },
  )
  nodes.set(node3.id, node3)
  shapes.set(node3.id, shape3)
  grid.insert(node3.id)

  // Get grid statistics
  const stats = grid.getStats()
  console.log("Grid Stats:", stats)
  console.log(`Total shapes: ${stats.nodeCount}`)
  console.log(`Total cells: ${stats.cellCount}`)
  console.log(
    `Average shapes per cell: ${stats.averageNodesPerCell.toFixed(2)}`,
  )
  console.log()

  return { grid, nodes, shapes, getBounds }
}

/**
 * Example 2: Point Queries
 */
function example2_PointQueries() {
  console.log("=== Example 2: Point Queries ===")

  const { grid, nodes } = example1_BasicUsage()

  // Query point inside shape 1
  console.log("Query point (100, 100):")
  const results1 = grid.queryPoint(100, 100)
  console.log(`Found ${results1.length} shape(s)`)
  results1.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) {
      console.log(
        `  - ${node.name} at (${node.transform.x}, ${node.transform.y})`,
      )
    }
  })

  // Query point inside shape 2
  console.log("\nQuery point (220, 220):")
  const results2 = grid.queryPoint(220, 220)
  console.log(`Found ${results2.length} shape(s)`)
  results2.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) {
      console.log(
        `  - ${node.name} at (${node.transform.x}, ${node.transform.y})`,
      )
    }
  })

  // Query point in empty space
  console.log("\nQuery point (1000, 1000):")
  const results3 = grid.queryPoint(1000, 1000)
  console.log(`Found ${results3.length} shape(s)`)
  console.log()
}

/**
 * Example 3: Region Queries
 */
function example3_RegionQueries() {
  console.log("=== Example 3: Region Queries ===")

  const { grid, nodes } = example1_BasicUsage()

  // Query region that contains shapes 1 and 2
  console.log("Query region (0, 0, 300, 300):")
  const results1 = grid.queryRegion(0, 0, 300, 300)
  console.log(`Found ${results1.length} shape(s)`)
  results1.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })

  // Query region that contains only shape 3
  console.log("\nQuery region (400, 400, 700, 700):")
  const results2 = grid.queryRegion(400, 400, 700, 700)
  console.log(`Found ${results2.length} shape(s)`)
  results2.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })

  // Query region that contains all shapes
  console.log("\nQuery region (0, 0, 1000, 1000):")
  const results3 = grid.queryRegion(0, 0, 1000, 1000)
  console.log(`Found ${results3.length} shape(s)`)
  results3.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })
  console.log()
}

/**
 * Example 4: Circle Queries
 */
function example4_CircleQueries() {
  console.log("=== Example 4: Circle Queries ===")

  const { grid, nodes } = example1_BasicUsage()

  // Query circle around shape 1
  console.log("Query circle at (100, 100) with radius 150:")
  const results1 = grid.queryCircle(100, 100, 150)
  console.log(`Found ${results1.length} shape(s)`)
  results1.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })

  // Query circle that includes shapes 1 and 2
  console.log("\nQuery circle at (150, 150) with radius 200:")
  const results2 = grid.queryCircle(150, 150, 200)
  console.log(`Found ${results2.length} shape(s)`)
  results2.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })

  // Query circle in empty space
  console.log("\nQuery circle at (1000, 1000) with radius 50:")
  const results3 = grid.queryCircle(1000, 1000, 50)
  console.log(`Found ${results3.length} shape(s)`)
  console.log()
}

/**
 * Example 5: Update and Remove
 */
function example5_UpdateAndRemove() {
  console.log("=== Example 5: Update and Remove ===")

  const { grid, nodes } = example1_BasicUsage()

  console.log("Initial query at (100, 100):")
  let results = grid.queryPoint(100, 100)
  console.log(`Found ${results.length} shape(s)`)

  // Move shape 1 to a new location
  const node1 = nodes.get("node1")!
  node1.transform.x = 400
  node1.transform.y = 400
  grid.update(node1.id)

  console.log("\nAfter moving shape to (400, 400):")
  console.log("Query at old location (100, 100):")
  results = grid.queryPoint(100, 100)
  console.log(`Found ${results.length} shape(s)`)

  console.log("Query at new location (450, 450):")
  results = grid.queryPoint(450, 450)
  console.log(`Found ${results.length} shape(s)`)
  results.forEach((r) => {
    const node = nodes.get(r.nodeId)
    if (node) console.log(`  - ${node.name}`)
  })

  // Remove shape 2
  console.log("\nRemoving node2...")
  grid.remove("node2")
  nodes.delete("node2")

  console.log("Query region (0, 0, 300, 300):")
  results = grid.queryRegion(0, 0, 300, 300)
  console.log(`Found ${results.length} shape(s)`)

  const stats = grid.getStats()
  console.log(
    `\nGrid now has ${stats.nodeCount} shapes in ${stats.cellCount} cells`,
  )
  console.log()
}

/**
 * Example 6: Performance with Many Shapes
 */
function example6_Performance() {
  console.log("=== Example 6: Performance Test ===")

  const nodes = new Map<string, ShapeNode>()
  const shapes = new Map<string, Shape>()

  const getBounds: BoundingBoxProvider = (nodeId: string) => {
    const node = nodes.get(nodeId)
    const shape = shapes.get(nodeId)
    if (!node || !shape) return null
    return BoundingBoxService.getAABB(node, shape)
  }

  const grid = new SpatialGrid({ cellSize: 100 }, getBounds)

  // Create 1000 random shapes
  console.log("Creating 1000 random shapes...")
  const startInsert = performance.now()

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 5000
    const y = Math.random() * 5000
    const width = 20 + Math.random() * 80
    const height = 20 + Math.random() * 80

    const node = createShapeNode(`node${i}`, { x, y, rotation: 0 })
    const shape = createRectangleShape(
      `node${i}`,
      { width, height },
      { fillColor: "#cccccc", strokeColor: "#000000" },
    )

    nodes.set(node.id, node)
    shapes.set(node.id, shape)
    grid.insert(node.id)
  }

  const insertTime = performance.now() - startInsert
  console.log(`Insert time: ${insertTime.toFixed(2)}ms`)

  // Perform 1000 point queries
  console.log("\nPerforming 1000 point queries...")
  const startQuery = performance.now()
  let totalFound = 0

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 5000
    const y = Math.random() * 5000
    const results = grid.queryPoint(x, y)
    totalFound += results.length
  }

  const queryTime = performance.now() - startQuery
  console.log(`Query time: ${queryTime.toFixed(2)}ms`)
  console.log(`Average per query: ${(queryTime / 1000).toFixed(3)}ms`)
  console.log(`Average shapes found: ${(totalFound / 1000).toFixed(2)}`)

  // Grid statistics
  const stats = grid.getStats()
  console.log("\nGrid Statistics:")
  console.log(`  Total shapes: ${stats.nodeCount}`)
  console.log(`  Total cells: ${stats.cellCount}`)
  console.log(
    `  Average shapes per cell: ${stats.averageNodesPerCell.toFixed(2)}`,
  )
  console.log(`  Cell size: ${stats.cellSize}`)
  console.log(
    `  Bounds: (${stats.bounds.minX.toFixed(0)}, ${stats.bounds.minY.toFixed(0)}) to (${stats.bounds.maxX.toFixed(0)}, ${stats.bounds.maxY.toFixed(0)})`,
  )
  console.log()
}

/**
 * Example 7: Rebuild Grid
 */
function example7_Rebuild() {
  console.log("=== Example 7: Rebuild Grid ===")

  const { grid, nodes } = example1_BasicUsage()

  console.log("Initial stats:")
  let stats = grid.getStats()
  console.log(`  Cells: ${stats.cellCount}, Nodes: ${stats.nodeCount}`)

  // Clear the grid
  console.log("\nClearing grid...")
  grid.clear()
  stats = grid.getStats()
  console.log(`  Cells: ${stats.cellCount}, Nodes: ${stats.nodeCount}`)

  // Rebuild from existing data
  console.log("\nRebuilding grid from existing nodes...")
  const nodeIds = Array.from(nodes.keys())
  grid.rebuild(nodeIds)
  stats = grid.getStats()
  console.log(`  Cells: ${stats.cellCount}, Nodes: ${stats.nodeCount}`)
  console.log()
}

/**
 * Run all examples
 */
export function runSpatialGridExamples() {
  console.log("╔════════════════════════════════════════╗")
  console.log("║   Spatial Grid Examples & Tests        ║")
  console.log("╚════════════════════════════════════════╝")
  console.log()

  example1_BasicUsage()
  example2_PointQueries()
  example3_RegionQueries()
  example4_CircleQueries()
  example5_UpdateAndRemove()
  example6_Performance()
  example7_Rebuild()

  console.log("╔════════════════════════════════════════╗")
  console.log("║   All Examples Completed!              ║")
  console.log("╚════════════════════════════════════════╝")
}

// Uncomment to run examples
// runSpatialGridExamples()

// Made with Bob
