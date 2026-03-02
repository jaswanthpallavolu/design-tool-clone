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

  private static createPathForRectangle(shape: RectangleShape): Path2D {
    const path = new Path2D()
    path.rect(0, 0, shape.local.width, shape.local.height)
    return path
  }

  private static createPathForEllipse(shape: EllipseShape): Path2D {
    const path = new Path2D()
    path.ellipse(
      shape.local.width / 2,
      shape.local.height / 2,
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
    path.moveTo(shape.local.x1, shape.local.y1)
    path.lineTo(shape.local.x2, shape.local.y2)
    return path
  }
}
