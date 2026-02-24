import {
  Shape,
  RectangleShape,
  EllipseShape,
  LineShape,
} from "../core/model/Shape"
import { AABB } from "../core/services/BoundingBoxService"

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

  static getShapeCenter(shape: Shape): { x: number; y: number } {
    if (shape.kind === "line") {
      return {
        x: (shape.p1.x + shape.p2.x) / 2,
        y: (shape.p1.y + shape.p2.y) / 2,
      }
    }
    return {
      x: shape.p1.x + shape.width / 2,
      y: shape.p1.y + shape.height / 2,
    }
  }

  static getRotation(shape: Shape): number {
    return shape.kind === "line" ? 0 : shape.rotation
  }

  private static createPathForRectangle(shape: RectangleShape): Path2D {
    const path = new Path2D()
    path.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
    return path
  }

  private static createPathForEllipse(shape: EllipseShape): Path2D {
    const path = new Path2D()
    path.ellipse(
      0,
      0,
      Math.abs(shape.width) / 2,
      Math.abs(shape.height) / 2,
      0,
      0,
      2 * Math.PI,
    )
    return path
  }

  private static createPathForLine(shape: LineShape): Path2D {
    const path = new Path2D()
    const center = this.getShapeCenter(shape)
    path.moveTo(shape.p1.x - center.x, shape.p1.y - center.y)
    path.lineTo(shape.p2.x - center.x, shape.p2.y - center.y)
    return path
  }
}
