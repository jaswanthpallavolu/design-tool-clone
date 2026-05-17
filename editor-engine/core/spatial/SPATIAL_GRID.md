# World-space Uniform Grid

A spatial partitioning data structure for efficient spatial queries in 2D space.

## Overview

The `SpatialGrid` divides 2D world space into a uniform grid of cells. Each cell tracks which node IDs overlap it, enabling fast spatial queries without checking every object in the scene.

## Key Concepts

### Grid Cells

- Space is divided into square cells of uniform size (configurable)
- Each cell maintains a set of node IDs that overlap it
- Cells are created on-demand and removed when empty (memory efficient)

### World Space

- All coordinates are in world space (not screen/viewport space)
- Grid automatically expands as objects are added outside current bounds
- No fixed boundaries - grid grows dynamically

### Callback-Based Architecture

- Grid is decoupled from specific node/shape types
- Caller provides a `BoundingBoxProvider` function to compute bounds
- Enables caching, lazy evaluation, and flexible data structures
- Makes the grid reusable across different systems

### Spatial Queries

- **Point Query**: Find all shapes at a specific point
- **Region Query**: Find all shapes in a rectangular area
- **Circle Query**: Find all shapes within a circular radius
- **Get All**: Retrieve all shapes in the grid

## Usage

### Basic Setup

```typescript
import {
  SpatialGrid,
  SpatialGridConfig,
  BoundingBoxProvider,
} from "editor-engine"

// Create storage for your entities
const nodes = new Map<string, ShapeNode>()
const shapes = new Map<string, Shape>()

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

const spatialGrid = new SpatialGrid(config, getBounds)
```

### Inserting Nodes

```typescript
// Add a node to your storage
const node: ShapeNode = createShapeNode(/* ... */)
const shape: Shape = createRectangleShape(/* ... */)
nodes.set(node.id, node)
shapes.set(node.id, shape)

// Insert into spatial grid (just the ID)
spatialGrid.insert(node.id)
```

### Updating Nodes

```typescript
// When a node moves or changes, update its position in the grid
node.transform.x = 200
node.transform.y = 300
spatialGrid.update(node.id)
```

### Removing Nodes

```typescript
// Remove a node from the grid
spatialGrid.remove(nodeId)
```

### Querying

#### Point Query

Find all nodes at a specific point:

```typescript
const results = spatialGrid.queryPoint(x, y)

// Results contain node IDs and their bounding boxes
for (const { nodeId, bounds } of results) {
  const node = nodes.get(nodeId)
  console.log(`Found node: ${node?.name}`, bounds)
}
```

#### Region Query

Find all nodes in a rectangular area:

```typescript
const results = spatialGrid.queryRegion(minX, minY, maxX, maxY)
```

#### Circle Query

Find all nodes within a circular radius:

```typescript
const results = spatialGrid.queryCircle(centerX, centerY, radius)
```

### Grid Management

#### Check if Node Exists

```typescript
if (spatialGrid.has(nodeId)) {
  console.log("Node is in the grid")
}
```

#### Get Node Count

```typescript
const count = spatialGrid.size()
console.log(`Grid contains ${count} nodes`)
```

#### Clear Grid

```typescript
spatialGrid.clear()
```

#### Rebuild Grid

Useful after bulk operations:

```typescript
const allNodeIds = Array.from(nodes.keys())
spatialGrid.rebuild(allNodeIds)
```

#### Get Statistics

```typescript
const stats = spatialGrid.getStats()
console.log(`Cells: ${stats.cellCount}`)
console.log(`Nodes: ${stats.nodeCount}`)
console.log(`Avg nodes per cell: ${stats.averageNodesPerCell}`)
console.log(`Cell size: ${stats.cellSize}`)
console.log(`Bounds:`, stats.bounds)
```

#### Change Cell Size

```typescript
// Warning: This rebuilds the entire grid
const allNodeIds = Array.from(nodes.keys())
spatialGrid.setCellSize(200, allNodeIds)
```

## Performance Characteristics

### Time Complexity

- **Insert**: O(k) where k = number of cells the shape overlaps
- **Remove**: O(k) where k = number of cells the shape overlaps
- **Update**: O(k) where k = number of cells the shape overlaps
- **Point Query**: O(n) where n = average shapes per cell
- **Region Query**: O(c × n) where c = cells in query region, n = avg shapes per cell
- **Circle Query**: O(c × n) where c = cells in query region, n = avg shapes per cell

### Space Complexity

- O(n × k) where n = number of shapes, k = average cells per shape
- Empty cells are not stored (memory efficient)

### Choosing Cell Size

The cell size significantly impacts performance:

- **Too Small**: Many cells, more memory, slower queries (checking many cells)
- **Too Large**: Few cells, less memory, slower queries (checking many shapes per cell)
- **Optimal**: Cell size ≈ average shape size

**Rule of thumb**: Set cell size to 1-2× the average shape dimension.

Example:

- If most shapes are 50-100 units: use cellSize = 100
- If shapes vary widely: use cellSize = median shape size

## Integration Example

### With Document Class

```typescript
class DocumentWithSpatialIndex {
  private document: Document
  private spatialGrid: SpatialGrid

  constructor() {
    this.document = new Document()

    // Create bounding box provider
    const getBounds = (nodeId: string) => {
      const node = this.document.getNode(nodeId)
      const shape = this.document.getShape(nodeId)
      if (!node || !shape || !isShapeNode(node)) return null
      return BoundingBoxService.getAABB(node, shape)
    }

    this.spatialGrid = new SpatialGrid({ cellSize: 100 }, getBounds)
  }

  addShape(node: ShapeNode, shape: Shape): void {
    this.document.addNode(node)
    this.document.addShape(shape)
    this.spatialGrid.insert(node.id)
  }

  removeShape(nodeId: string): void {
    this.spatialGrid.remove(nodeId)
    this.document.removeNode(nodeId)
  }

  updateShape(node: ShapeNode, shape: Shape): void {
    this.document.updateNode(node)
    this.document.updateShape(shape)
    this.spatialGrid.update(node.id)
  }

  findShapesAt(x: number, y: number): ShapeNode[] {
    const results = this.spatialGrid.queryPoint(x, y)
    return results
      .map((r) => this.document.getNode(r.nodeId))
      .filter((n): n is ShapeNode => n !== undefined && isShapeNode(n))
  }
}
```

### With Hit Testing

```typescript
function findShapeAtPoint(
  x: number,
  y: number,
  spatialGrid: SpatialGrid,
  document: Document,
  hitTestAdapter: HitTestPort,
): ShapeNode | null {
  // Get candidate shapes from spatial grid (fast broad phase)
  const candidates = spatialGrid.queryPoint(x, y)

  // Perform precise hit test on candidates (narrow phase)
  for (const { nodeId } of candidates) {
    const node = document.getNode(nodeId)
    const shape = document.getShape(nodeId)

    if (node && shape && isShapeNode(node)) {
      if (hitTestAdapter.hitTest(node, shape, x, y)) {
        return node
      }
    }
  }

  return null
}
```

### With Caching for Performance

```typescript
class CachedSpatialIndex {
  private spatialGrid: SpatialGrid
  private boundsCache = new Map<string, AABB>()
  private nodes: Map<string, ShapeNode>
  private shapes: Map<string, Shape>

  constructor(nodes: Map<string, ShapeNode>, shapes: Map<string, Shape>) {
    this.nodes = nodes
    this.shapes = shapes

    // Provider uses cache
    const getBounds = (nodeId: string) => {
      // Check cache first
      let bounds = this.boundsCache.get(nodeId)
      if (bounds) return bounds

      // Compute and cache
      const node = this.nodes.get(nodeId)
      const shape = this.shapes.get(nodeId)
      if (!node || !shape) return null

      bounds = BoundingBoxService.getAABB(node, shape)
      this.boundsCache.set(nodeId, bounds)
      return bounds
    }

    this.spatialGrid = new SpatialGrid({ cellSize: 100 }, getBounds)
  }

  update(nodeId: string): void {
    // Invalidate cache
    this.boundsCache.delete(nodeId)
    // Update grid
    this.spatialGrid.update(nodeId)
  }
}
```

## Use Cases

### 1. Fast Hit Testing

Instead of checking every shape, only check shapes in the cell containing the point.

### 2. Marquee Selection

Query a rectangular region to find all shapes within the selection box.

### 3. Collision Detection

Query shapes near an object to check for collisions, avoiding O(n²) checks.

### 4. Viewport Culling

Only render shapes that intersect the visible viewport region.

### 5. Proximity Queries

Find all shapes near a point (useful for snapping, tooltips, etc.).

### 6. Spatial Clustering

Group nearby shapes for batch operations or visual effects.

## Advantages of Callback Architecture

### 1. Decoupling

- Grid doesn't depend on Node/Shape types
- Works with any entity system
- Easy to integrate into existing codebases

### 2. Flexibility

- Caller controls when/how bounds are calculated
- Can cache bounds externally
- Can compute bounds on-demand or use pre-computed values

### 3. Performance

- Enables optimization strategies (caching, lazy evaluation)
- No forced recalculation on every operation
- Caller can batch bound calculations

### 4. Testability

- Easy to mock the bounding box provider
- Simple unit tests without complex setup
- Can test with synthetic data

### 5. Reusability

- Same grid implementation works for different systems
- Can be used with different shape types
- Future-proof against data structure changes

## Limitations

- Only works with axis-aligned bounding boxes (AABBs)
- Rotation is handled by computing AABB of rotated shape
- Very large shapes spanning many cells can reduce efficiency
- Not suitable for extremely dynamic scenes (constant insertions/removals)

## Best Practices

1. **Batch Operations**: When adding many shapes, consider using `rebuild()` instead of multiple `insert()` calls
2. **Update Frequency**: Only call `update()` when shapes actually move
3. **Cell Size Tuning**: Profile your application and adjust cell size based on actual shape sizes
4. **Memory Management**: Call `clear()` when switching documents or scenes
5. **Query Optimization**: Cache query results when possible, especially for static scenes
6. **Bounds Caching**: Implement caching in your BoundingBoxProvider for frequently queried nodes
7. **Lazy Updates**: Batch updates and apply them in a single frame rather than immediately

## Advanced Topics

### Dynamic Cell Size Adjustment

```typescript
// Monitor performance and adjust cell size
const stats = spatialGrid.getStats()
const nodeIds = Array.from(nodes.keys())

if (stats.averageNodesPerCell > 10) {
  // Too many shapes per cell, reduce cell size
  spatialGrid.setCellSize(stats.cellSize / 2, nodeIds)
} else if (stats.averageNodesPerCell < 2) {
  // Too few shapes per cell, increase cell size
  spatialGrid.setCellSize(stats.cellSize * 2, nodeIds)
}
```

### Temporal Coherence

For animated scenes, track which shapes moved and only update those:

```typescript
const movedShapes = new Set<string>()

function onShapeMove(nodeId: string) {
  movedShapes.add(nodeId)
}

function updateSpatialGrid() {
  for (const nodeId of movedShapes) {
    spatialGrid.update(nodeId)
  }
  movedShapes.clear()
}
```

### Hierarchical Grids

For scenes with shapes of vastly different sizes, use multiple grids:

```typescript
const fineGrid = new SpatialGrid({ cellSize: 50 }, getBounds)
const coarseGrid = new SpatialGrid({ cellSize: 500 }, getBounds)

// Small shapes go in fine grid, large shapes in coarse grid
function insertShape(nodeId: string, size: number) {
  if (size < 100) {
    fineGrid.insert(nodeId)
  } else {
    coarseGrid.insert(nodeId)
  }
}
```

## References

- [Spatial Hashing](https://en.wikipedia.org/wiki/Spatial_hashing)
- [Grid-based Collision Detection](https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/spatial-hashing-r2697/)
- [Broad Phase Collision Detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection)
