import { InteractionState } from "./InteractionState"
import { PointerEventData } from "../../../types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { Shape } from "../../../model/Shape"
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
    if (shape.kind === "line" && original.kind === "line") {
      this.resizeLine(shape, original, dx, dy, handle)
    } else if (
      (shape.kind === "rectangle" || shape.kind === "ellipse") &&
      (original.kind === "rectangle" || original.kind === "ellipse")
    ) {
      this.resizeRectangular(shape, original, dx, dy, handle)
    }
  }

  private resizeLine(
    shape: Shape & { kind: "line" },
    original: Shape & { kind: "line" },
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // Top-left based: transform.x/y stays fixed, adjust local coords
    if (handle === "p1") {
      // Move p1 endpoint
      shape.local.x1 = original.local.x1 + dx
      shape.local.y1 = original.local.y1 + dy
    } else if (handle === "p2") {
      // Move p2 endpoint
      shape.local.x2 = original.local.x2 + dx
      shape.local.y2 = original.local.y2 + dy
    }
  }

  private resizeRectangular(
    shape: Shape & { kind: "rectangle" | "ellipse" },
    original: Shape & { kind: "rectangle" | "ellipse" },
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // Transform delta to local space
    const cos = Math.cos(-shape.transform.rotation)
    const sin = Math.sin(-shape.transform.rotation)
    const localDx = dx * cos - dy * sin
    const localDy = dx * sin + dy * cos

    // Top-left based resize: adjust both position and size
    switch (handle) {
      case "nw": // Top-left corner
        shape.local.width = original.local.width - localDx
        shape.local.height = original.local.height - localDy
        shape.transform.x = original.transform.x + dx
        shape.transform.y = original.transform.y + dy
        break
      case "ne": // Top-right corner
        shape.local.width = original.local.width + localDx
        shape.local.height = original.local.height - localDy
        shape.transform.y = original.transform.y + dy
        break
      case "se": // Bottom-right corner
        shape.local.width = original.local.width + localDx
        shape.local.height = original.local.height + localDy
        break
      case "sw": // Bottom-left corner
        shape.local.width = original.local.width - localDx
        shape.local.height = original.local.height + localDy
        shape.transform.x = original.transform.x + dx
        break
      case "n": // Top edge
        shape.local.height = original.local.height - localDy
        shape.transform.y = original.transform.y + dy
        break
      case "e": // Right edge
        shape.local.width = original.local.width + localDx
        break
      case "s": // Bottom edge
        shape.local.height = original.local.height + localDy
        break
      case "w": // Left edge
        shape.local.width = original.local.width - localDx
        shape.transform.x = original.transform.x + dx
        break
    }

    // Prevent negative dimensions
    if (shape.local.width < 1) shape.local.width = 1
    if (shape.local.height < 1) shape.local.height = 1
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
