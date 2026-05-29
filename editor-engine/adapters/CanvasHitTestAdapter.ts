import { Shape } from "../core/model/Shape"
import { Node } from "../core/model/Node"
import { ShapeHitTestPort, HitTestHelper } from "../core/ports/HitTestPort"
import { CanvasPathBuilder } from "./CanvasPathBuilder"

export class CanvasHitTestAdapter implements ShapeHitTestPort {
  private ctx: CanvasRenderingContext2D
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }
  testShape(node: Node, shape: Shape, x: number, y: number): boolean {
    this.ctx.save()
    const center = HitTestHelper.getShapeCenter(node, shape)
    this.ctx.translate(center.x, center.y)
    this.ctx.rotate(node.transform.rotation)
    this.ctx.lineWidth = 10
    const path = CanvasPathBuilder.getPath(shape)
    const hitFound =
      shape.type === "LINE"
        ? this.ctx.isPointInStroke(path, x, y)
        : this.ctx.isPointInPath(path, x, y)
    this.ctx.restore()
    return hitFound
  }
}
