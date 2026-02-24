import { RenderPort } from "../core/ports/RenderPort"
import { Editor } from "../core/Editor"
import {
  Shape,
  RectangleShape,
  EllipseShape,
  LineShape,
} from "../core/model/Shape"
import { HitTestPort } from "../core/ports/HitTestPort"
import { CanvasHitTestAdapter } from "./CanvasHitTestAdapter"
import { CanvasPathBuilder } from "./CanvasPathBuilder"
import { EditorConfig } from "../config/EditorConfig"

export class CanvasRenderer implements RenderPort {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  editor: Editor
  imageData: ImageData
  private hitTestAdapter: HitTestPort

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
    this.imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    )
    this.editor = editor
    this.hitTestAdapter = new CanvasHitTestAdapter(this.ctx)
  }

  getHitTestAdapter(): HitTestPort | null {
    return this.hitTestAdapter
  }

  renderShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.editor.document.getAll().forEach((shape) => {
      this.renderShape(shape)
    })
    this.imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    )
  }

  private renderShape(shape: Shape): void {
    this.ctx.save()
    this.ctx.fillStyle = shape.fillStyle
    this.ctx.strokeStyle = shape.strokeStyle
    const path: Path2D = CanvasPathBuilder.getPath(shape)
    this.applyTransform(
      CanvasPathBuilder.getShapeCenter(shape),
      CanvasPathBuilder.getRotation(shape),
    )
    if (shape.kind === "line") {
      this.ctx.lineWidth = shape.lineWidth
      this.ctx.stroke(path)
    } else this.ctx.fill(path)
    this.ctx.restore()
  }

  private applyTransform(
    center: { x: number; y: number },
    rotation: number,
  ): void {
    this.ctx.translate(center.x, center.y)
    this.ctx.rotate(rotation)
  }

  renderHoverOutline(): void {
    if (!this.editor.state.hoveredShapeId) return
    const hoveredShape = this.editor.document.getById(
      this.editor.state.hoveredShapeId,
    )
    if (!hoveredShape) return

    this.ctx.save()
    this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor
    this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth
    const path: Path2D = CanvasPathBuilder.getPath(hoveredShape)
    this.applyTransform(
      CanvasPathBuilder.getShapeCenter(hoveredShape),
      CanvasPathBuilder.getRotation(hoveredShape),
    )
    this.ctx.stroke(path)
    this.ctx.restore()
  }

  renderSelectionBox(): void {
    if (!this.editor.state.marquee) return
    this.ctx.save()
    const path = CanvasPathBuilder.getPathFromAABB(this.editor.state.marquee)
    this.ctx.strokeStyle = EditorConfig.renderOptions.selectionBoxStrokeColor
    this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize
    this.ctx.fillStyle = EditorConfig.renderOptions.selectionBoxFillColor
    this.ctx.stroke(path)
    this.ctx.fill(path)
    this.ctx.restore()
  }

  renderSelectionBounds(): void {
    if (!this.editor.state.selectionBounds) return
    this.ctx.save()
    const path = CanvasPathBuilder.getPathFromAABB(
      this.editor.state.selectionBounds,
    )
    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize
    this.ctx.stroke(path)
    this.ctx.restore()
  }

  clearSelectionBox(): void {
    this.ctx.putImageData(this.imageData, 0, 0)
  }
}
