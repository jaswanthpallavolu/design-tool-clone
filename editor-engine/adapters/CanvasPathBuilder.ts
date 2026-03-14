import {
  Shape,
  RectangleShape,
  EllipseShape,
  LineShape,
} from "../core/model/Shape"
import { AABB } from "../core/services/BoundingBoxService"
import { HandleGeometry } from "../core/services/HandleGeometryService"

export interface HandlePaths {
  corners: Record<string, Path2D>
  edges: Record<string, Path2D>
  rotation: Record<string, Path2D>
}

export class CanvasPathBuilder {
  private constructor() {}

  static getPath(shape: Shape): Path2D {
    switch (shape.kind) {
      case "rectangle":
        return this.createPathForRectangle(shape)
      case "ellipse":
        return this.createPathForEllipse(shape)
      case "line":
        return this.createPathForLine(shape)
    }
  }

  static getPathFromAABB(box: AABB): Path2D {
    const path = new Path2D()
    const width = box.maxX - box.minX
    const height = box.maxY - box.minY
    path.rect(box.minX, box.minY, width, height)
    return path
  }

  private static createPathForRectangle(shape: RectangleShape): Path2D {
    const path = new Path2D()
    // Center-based: draw rectangle centered at origin
    const halfW = shape.local.width / 2
    const halfH = shape.local.height / 2
    path.rect(-halfW, -halfH, shape.local.width, shape.local.height)
    return path
  }

  private static createPathForEllipse(shape: EllipseShape): Path2D {
    const path = new Path2D()
    // Center-based: draw ellipse centered at origin
    path.ellipse(
      0,
      0,
      Math.abs(shape.local.width) / 2,
      Math.abs(shape.local.height) / 2,
      0,
      0,
      2 * Math.PI,
    )
    return path
  }

  private static createPathForLine(shape: LineShape): Path2D {
    const path = new Path2D()
    // Center-based: draw line centered at origin
    const centerX = (shape.local.x1 + shape.local.x2) / 2
    const centerY = (shape.local.y1 + shape.local.y2) / 2
    path.moveTo(shape.local.x1 - centerX, shape.local.y1 - centerY)
    path.lineTo(shape.local.x2 - centerX, shape.local.y2 - centerY)
    return path
  }

  static getHandlePaths(geometry: HandleGeometry): HandlePaths {
    const cornerPaths: Record<string, Path2D> = {}
    const edgePaths: Record<string, Path2D> = {}
    const rotationPaths: Record<string, Path2D> = {}

    // Create corner handle paths (rectangles)
    for (const [key, corner] of Object.entries(geometry.corners)) {
      const path = new Path2D()
      path.rect(
        corner.x - corner.size / 2,
        corner.y - corner.size / 2,
        corner.size,
        corner.size,
      )
      cornerPaths[key] = path
    }

    // Create edge handle paths (lines)
    for (const [key, edge] of Object.entries(geometry.edges)) {
      const path = new Path2D()
      path.moveTo(edge.x1, edge.y1)
      path.lineTo(edge.x2, edge.y2)
      edgePaths[key] = path
    }

    // Create rotation handle paths (circles)
    for (const [key, rotation] of Object.entries(geometry.rotation)) {
      const path = new Path2D()
      path.arc(rotation.x, rotation.y, rotation.radius, 0, Math.PI * 2)
      rotationPaths[key] = path
    }

    return {
      corners: cornerPaths,
      edges: edgePaths,
      rotation: rotationPaths,
    }
  }
}
