import { Shape } from "../core/model/Shape"
import { HitTestPort } from "../core/ports/HitTestPort"
import { CanvasPathBuilder } from "./CanvasPathBuilder"

export class CanvasHitTestAdapter implements HitTestPort {
  private ctx: CanvasRenderingContext2D
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }
  testShape(shape: Shape, x: number, y: number): boolean {
    this.ctx.save()
    const center = CanvasPathBuilder.getShapeCenter(shape)
    const rotation = CanvasPathBuilder.getRotation(shape)
    this.ctx.translate(center.x, center.y)
    this.ctx.rotate(rotation)
    this.ctx.lineWidth = 10
    const path = CanvasPathBuilder.getPath(shape)
    const hitFound =
      shape.kind === "line"
        ? this.ctx.isPointInStroke(path, x, y)
        : this.ctx.isPointInPath(path, x, y)
    this.ctx.restore()
    return hitFound
  }
}
