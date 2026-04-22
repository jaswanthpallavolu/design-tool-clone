import { InteractionState } from "./InteractionState"
import { PointerEventData } from "../../../types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import {
  Shape,
  LineShape,
  RectangleShape,
  EllipseShape,
} from "../../../model/Shape"
import { Editor } from "../../../Editor"

export class ResizeState implements InteractionState {
  private startMouse: { x: number; y: number } = { x: 0, y: 0 }
  private originalShapes: Map<string, Shape> = new Map()

  constructor(private handleType: string) {}

  onEnter?(ctx: ToolContext): void {
    const { editor } = ctx
    // Store original shape data for all selected shapes
    editor.selection.getAll().forEach((shapeId) => {
      const shape = editor.document.getById(shapeId)
      if (shape) {
        this.originalShapes.set(shapeId, JSON.parse(JSON.stringify(shape)))
      }
    })
  }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.startMouse = { x: e.clientX, y: e.clientY }
  }

  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const dx = e.clientX - this.startMouse.x
    const dy = e.clientY - this.startMouse.y

    const selection = editor.selection.getAll()

    if (selection.length === 1) {
      // Single shape resize
      const shape = editor.document.getById(selection[0])
      const original = this.originalShapes.get(selection[0])
      if (!shape || !original) return

      this.resizeSingleShape(shape, original, dx, dy, this.handleType)
      editor.document.update(shape)
    } else if (selection.length > 1 && editor.state.selectionBounds) {
      // Multi-shape resize (scale all shapes proportionally)
      this.resizeMultipleShapes(editor, dx, dy, this.handleType)
    }

    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
    ctx.renderOverlays()
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    // Resize complete
  }

  private resizeSingleShape(
    shape: Shape,
    original: Shape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    if (shape.type === "LINE" && original.type === "LINE") {
      this.resizeLine(shape, original, dx, dy, handle)
    } else if (
      (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") &&
      (original.type === "RECTANGLE" || original.type === "ELLIPSE")
    ) {
      this.resizeRectangular(shape, original, dx, dy, handle)
    }
  }

  private resizeLine(
    shape: LineShape,
    original: LineShape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // Top-left based: geometry.x/y stays fixed, adjust local coords
    if (handle === "p1") {
      // Move p1 endpoint
      shape.geometry.x1 = original.geometry.x1 + dx
      shape.geometry.y1 = original.geometry.y1 + dy
    } else if (handle === "p2") {
      // Move p2 endpoint
      shape.geometry.x2 = original.geometry.x2 + dx
      shape.geometry.y2 = original.geometry.y2 + dy
    }
  }

  private resizeRectangular(
    shape: RectangleShape | EllipseShape,
    original: RectangleShape | EllipseShape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // Transform delta to local space
    const cos = Math.cos(-shape.geometry.rotation)
    const sin = Math.sin(-shape.geometry.rotation)
    const localDx = dx * cos - dy * sin
    const localDy = dx * sin + dy * cos

    // Top-left based resize: adjust both position and size
    switch (handle) {
      case "nw": // Top-left corner
        shape.geometry.width = original.geometry.width - localDx
        shape.geometry.height = original.geometry.height - localDy
        shape.geometry.x = original.geometry.x + dx
        shape.geometry.y = original.geometry.y + dy
        break
      case "ne": // Top-right corner
        shape.geometry.width = original.geometry.width + localDx
        shape.geometry.height = original.geometry.height - localDy
        shape.geometry.y = original.geometry.y + dy
        break
      case "se": // Bottom-right corner
        shape.geometry.width = original.geometry.width + localDx
        shape.geometry.height = original.geometry.height + localDy
        break
      case "sw": // Bottom-left corner
        shape.geometry.width = original.geometry.width - localDx
        shape.geometry.height = original.geometry.height + localDy
        shape.geometry.x = original.geometry.x + dx
        break
      case "n": // Top edge
        shape.geometry.height = original.geometry.height - localDy
        shape.geometry.y = original.geometry.y + dy
        break
      case "e": // Right edge
        shape.geometry.width = original.geometry.width + localDx
        break
      case "s": // Bottom edge
        shape.geometry.height = original.geometry.height + localDy
        break
      case "w": // Left edge
        shape.geometry.width = original.geometry.width - localDx
        shape.geometry.x = original.geometry.x + dx
        break
    }

    // Prevent negative dimensions
    if (shape.geometry.width < 1) shape.geometry.width = 1
    if (shape.geometry.height < 1) shape.geometry.height = 1
  }

  private resizeMultipleShapes(
    editor: Editor,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // For multi-select, scale all shapes proportionally
    // This is more complex and would require calculating scale factors
    // based on the handle being dragged and the original bounds
    // For now, we'll implement a simplified version

    // TODO: Implement proportional multi-shape resize
    console.log("Multi-shape resize not yet implemented")
  }
}

// Made with Bob
