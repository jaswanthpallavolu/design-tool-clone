import { RenderPort } from "../core/ports/RenderPort"
import { Editor } from "../core/Editor"
import { Shape } from "../core/model/Shape"
import { Node } from "../core/model/Node"
import { HitTestPort } from "../core/ports/HitTestPort"
import { CanvasHitTestAdapter } from "./CanvasHitTestAdapter"
import { CanvasPathBuilder, HandlePaths } from "./CanvasPathBuilder"
import { EditorConfig } from "../config/EditorConfig"
import { HandleGeometryService } from "../core/services/HandleGeometryService"
import {
  AABB,
  OBB,
  BoundingBoxService,
} from "../core/services/BoundingBoxService"

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
    this.editor.document.getShapeNodes().forEach(([node, shape]) => {
      this.renderShape(node, shape)
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

  private renderShape(node: Node, shape: Shape): void {
    if (!node.visible) return

    this.ctx.save()
    this.ctx.fillStyle = shape.style.fillColor
    this.ctx.strokeStyle = shape.style.strokeColor
    const path: Path2D = CanvasPathBuilder.getPath(shape)

    // Calculate center from node position
    let centerX = node.transform.x
    let centerY = node.transform.y
    if (shape.type === "LINE") {
      centerX += (shape.geometry.x1 + shape.geometry.x2) / 2
      centerY += (shape.geometry.y1 + shape.geometry.y2) / 2
    } else {
      centerX += shape.geometry.width / 2
      centerY += shape.geometry.height / 2
    }

    // Translate to center and rotate
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(node.transform.rotation)

    if (shape.type === "LINE") {
      this.ctx.lineWidth = shape.geometry.lineWidth
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
    if (!this.editor.state.hoveredNodeId) return
    const hoveredNode = this.editor.document.getNode(
      this.editor.state.hoveredNodeId,
    )
    const hoveredShape = this.editor.document.getShape(
      this.editor.state.hoveredNodeId,
    )
    if (!hoveredNode || !hoveredShape) return

    this.ctx.save()
    this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor
    this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth
    const path: Path2D = CanvasPathBuilder.getPath(hoveredShape)

    // Calculate center from node position
    let centerX = hoveredNode.transform.x
    let centerY = hoveredNode.transform.y
    if (hoveredShape.type === "LINE") {
      centerX += (hoveredShape.geometry.x1 + hoveredShape.geometry.x2) / 2
      centerY += (hoveredShape.geometry.y1 + hoveredShape.geometry.y2) / 2
    } else {
      centerX += hoveredShape.geometry.width / 2
      centerY += hoveredShape.geometry.height / 2
    }

    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(hoveredNode.transform.rotation)
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
      // Multi-select: Use AABB handles (without corner handles, with rotation)
      const geometry = HandleGeometryService.getAABBHandleGeometry(
        this.editor.state.selectionBounds,
      )
      const paths = CanvasPathBuilder.getHandlePaths(geometry)
      this.drawHandlesForAABB(
        paths,
        this.editor.state.selectionBounds,
        false,
        true,
      ) // Hide corners, show rotation for multi-select
    } else if (selection.length === 1) {
      const node = this.editor.document.getNode(selection[0])
      const shape = this.editor.document.getShape(selection[0])

      // If it's a group (no shape), use AABB handles (without corners, with rotation)
      if (node && !shape && this.editor.state.selectionBounds) {
        const geometry = HandleGeometryService.getAABBHandleGeometry(
          this.editor.state.selectionBounds,
        )
        const paths = CanvasPathBuilder.getHandlePaths(geometry)
        this.drawHandlesForAABB(
          paths,
          this.editor.state.selectionBounds,
          false,
          true,
        ) // Hide corners, show rotation for groups
      } else if (node && shape) {
        // Single shape: Use shape-specific handles
        const geometry = HandleGeometryService.getShapeHandleGeometry(shape)
        const paths = CanvasPathBuilder.getHandlePaths(geometry)
        this.drawHandlesForShape(paths, node, shape)
      }
    }
  }

  private drawHandlesForAABB(
    paths: HandlePaths,
    aabb: AABB,
    showCorners: boolean = true,
    showRotation: boolean = true,
  ): void {
    const width = aabb.maxX - aabb.minX
    const height = aabb.maxY - aabb.minY
    const centerX = aabb.minX + width / 2
    const centerY = aabb.minY + height / 2

    this.ctx.save()
    this.ctx.translate(centerX, centerY)

    // Draw corner handles (only if showCorners is true)
    if (showCorners) {
      this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor
      this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor
      this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth
      for (const path of Object.values(paths.corners)) {
        this.ctx.fill(path)
        this.ctx.stroke(path)
      }
    }

    // Draw edge handles
    this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor
    this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth
    for (const path of Object.values(paths.edges)) {
      this.ctx.stroke(path)
    }

    // Draw rotation handles (only if showRotation is true)
    if (showRotation) {
      this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor
      this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor
      this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth
      for (const path of Object.values(paths.rotation)) {
        this.ctx.fill(path)
        this.ctx.stroke(path)
      }
    }

    this.ctx.restore()
  }

  private drawHandlesForShape(
    paths: HandlePaths,
    node: Node,
    shape: Shape,
  ): void {
    this.ctx.save()

    // Calculate center position based on shape type
    let centerX = node.transform.x
    let centerY = node.transform.y

    if (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") {
      centerX += shape.geometry.width / 2
      centerY += shape.geometry.height / 2
    } else if (shape.type === "LINE") {
      centerX += (shape.geometry.x1 + shape.geometry.x2) / 2
      centerY += (shape.geometry.y1 + shape.geometry.y2) / 2
    }

    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(node.transform.rotation)

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
