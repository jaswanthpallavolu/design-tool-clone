import { RenderPort } from "../core/ports/RenderPort"
import { Editor } from "../core/Editor"
import { Shape } from "../core/model/Shape"
import { Rect } from "../core/model/Rect"

export class CanvasRenderer implements RenderPort {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  editor: Editor

  constructor({
    canvas,
    editor,
  }: {
    canvas: HTMLCanvasElement
    editor: Editor
  }) {
    this.canvas = canvas
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context from canvas")
    }
    this.ctx = ctx
    this.editor = editor
  }

  renderShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.editor.document.getAll().forEach((shape) => {
      this.renderShape(shape)
    })
  }

  private renderShape(shape: Shape): void {
    this.ctx.save()
    this.ctx.fillStyle = shape.fillStyle
    this.ctx.strokeStyle = shape.strokeStyle

    switch (shape.kind) {
      case "rectangle":
        this.renderRectangle(shape)
        break
      case "ellipse":
        this.renderEllipse(shape)
        break
      case "line":
        this.renderLine(shape)
        break
    }

    this.ctx.restore()
  }

  private renderRectangle(shape: Shape): void {
    if (shape.width === undefined || shape.height === undefined) {
      console.warn("Rectangle missing dimensions:", shape.id)
      return
    }

    const center = this.calculateCenter(shape.p1, shape.width, shape.height)
    this.applyTransform(center, shape.rotation ?? 0)

    const path = new Path2D()
    path.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
    this.ctx.fill(path)
  }

  private renderEllipse(shape: Shape): void {
    if (shape.width === undefined || shape.height === undefined) {
      console.warn("Ellipse missing dimensions:", shape.id)
      return
    }

    const center = this.calculateCenter(shape.p1, shape.width, shape.height)
    this.applyTransform(center, shape.rotation ?? 0)

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
    this.ctx.fill(path)
  }

  private renderLine(shape: Shape): void {
    if (!shape.p2) {
      console.warn("Line missing p2 point:", shape.id)
      return
    }

    const center = this.calculateMidpoint(shape.p1, shape.p2)
    this.ctx.lineWidth = shape.lineWidth ?? 1
    this.ctx.translate(center.x, center.y)

    const path = new Path2D()
    path.moveTo(shape.p1.x - center.x, shape.p1.y - center.y)
    path.lineTo(shape.p2.x - center.x, shape.p2.y - center.y)
    this.ctx.stroke(path)
  }

  private calculateCenter(
    p1: { x: number; y: number },
    width: number,
    height: number,
  ): { x: number; y: number } {
    return {
      x: p1.x + width / 2,
      y: p1.y + height / 2,
    }
  }

  private calculateMidpoint(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ): { x: number; y: number } {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    }
  }

  private applyTransform(
    center: { x: number; y: number },
    rotation: number,
  ): void {
    this.ctx.translate(center.x, center.y)
    this.ctx.rotate(rotation)
  }

  renderSelectionBox(box: Rect): void {}

  clearSelectionBox(): void {}
}
