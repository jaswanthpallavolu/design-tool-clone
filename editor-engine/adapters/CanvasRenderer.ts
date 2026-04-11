import { RenderPort } from "../core/ports/RenderPort"
import { Editor } from "../core/Editor"
import { Shape } from "../core/model/Shape"
import { HitTestPort } from "../core/ports/HitTestPort"
import { CanvasHitTestAdapter } from "./CanvasHitTestAdapter"
import { CanvasPathBuilder, HandlePaths } from "./CanvasPathBuilder"
import { EditorConfig } from "../config/EditorConfig"
import { HandleGeometryService } from "../core/services/HandleGeometryService"
import { AABB } from "../core/services/BoundingBoxService"

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
    this.clear()
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

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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

    // Calculate center from top-left position
    let centerX = shape.transform.x
    let centerY = shape.transform.y
    if (shape.kind === "line") {
      centerX += (shape.local.x1 + shape.local.x2) / 2
      centerY += (shape.local.y1 + shape.local.y2) / 2
    } else {
      centerX += shape.local.width / 2
      centerY += shape.local.height / 2
    }

    // Translate to center and rotate
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(shape.transform.rotation)

    if (shape.kind === "line") {
      this.ctx.lineWidth = shape.lineWidth
    } else this.ctx.fill(path)
    this.ctx.stroke(path)
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

    // Calculate center from top-left position
    let centerX = hoveredShape.transform.x
    let centerY = hoveredShape.transform.y
    if (hoveredShape.kind === "line") {
      centerX += (hoveredShape.local.x1 + hoveredShape.local.x2) / 2
      centerY += (hoveredShape.local.y1 + hoveredShape.local.y2) / 2
    } else {
      centerX += hoveredShape.local.width / 2
      centerY += hoveredShape.local.height / 2
    }

    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(hoveredShape.transform.rotation)
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
    const selection = this.editor.selection.getAll()
    if (!this.editor.state.selectionBounds || selection.length < 2) return
    this.ctx.save()
    const path = CanvasPathBuilder.getPathFromAABB(
      this.editor.state.selectionBounds,
    )
    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize
    this.ctx.stroke(path)
    this.ctx.restore()
  }

  renderSelectionHandles(): void {
    const selection = this.editor.selection.getAll()

    if (this.editor.state.selectionBounds && selection.length > 1) {
      // Multi-select: Use AABB handles
      const geometry = HandleGeometryService.getAABBHandleGeometry(
        this.editor.state.selectionBounds,
      )
      const paths = CanvasPathBuilder.getHandlePaths(geometry)
      this.drawHandlesForAABB(paths, this.editor.state.selectionBounds)
    } else if (selection.length === 1) {
      // Single select: Use shape-specific handles
      const shape = this.editor.document.getById(selection[0])
      if (shape) {
        const geometry = HandleGeometryService.getShapeHandleGeometry(shape)
        const paths = CanvasPathBuilder.getHandlePaths(geometry)
        this.drawHandlesForShape(paths, shape)
      }
    }
  }

  private drawHandlesForAABB(paths: HandlePaths, aabb: AABB): void {
    const width = aabb.maxX - aabb.minX
    const height = aabb.maxY - aabb.minY
    const centerX = aabb.minX + width / 2
    const centerY = aabb.minY + height / 2

    this.ctx.save()
    this.ctx.translate(centerX, centerY)

    // Draw corner handles
    this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor
    this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth
    for (const path of Object.values(paths.corners)) {
      this.ctx.fill(path)
      this.ctx.stroke(path)
    }

    // Draw edge handles
    this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth
    for (const path of Object.values(paths.edges)) {
      this.ctx.stroke(path)
    }

    // Draw rotation handles
    this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor
    this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth
    for (const path of Object.values(paths.rotation)) {
      this.ctx.fill(path)
      this.ctx.stroke(path)
    }

    this.ctx.restore()
  }

  private drawHandlesForShape(paths: HandlePaths, shape: Shape): void {
    this.ctx.save()

    // Calculate center position based on shape type
    let centerX = shape.transform.x
    let centerY = shape.transform.y

    if (shape.kind === "rectangle" || shape.kind === "ellipse") {
      centerX += shape.local.width / 2
      centerY += shape.local.height / 2
    } else if (shape.kind === "line") {
      centerX += (shape.local.x1 + shape.local.x2) / 2
      centerY += (shape.local.y1 + shape.local.y2) / 2
    }

    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(shape.transform.rotation)

    // Draw corner handles
    this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor
    this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth
    for (const path of Object.values(paths.corners)) {
      this.ctx.fill(path)
      this.ctx.stroke(path)
    }

    // Draw edge handles (if any)
    if (Object.keys(paths.edges).length > 0) {
      this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor
      this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth
      for (const path of Object.values(paths.edges)) {
        this.ctx.stroke(path)
      }
    }

    // Draw rotation handles
    this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor
    this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth
    for (const path of Object.values(paths.rotation)) {
      this.ctx.fill(path)
      this.ctx.stroke(path)
    }

    this.ctx.restore()
  }

  clearSelectionBox(): void {
    this.ctx.putImageData(this.imageData, 0, 0)
  }
}
