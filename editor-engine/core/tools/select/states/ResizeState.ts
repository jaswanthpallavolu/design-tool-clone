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
import { Node, isGroupNode } from "../../../model/Node"
import { Editor } from "../../../Editor"
import { TransformShapesCommand } from "../../../commands"

interface OriginalNodeShape {
  node: Node
  shape: Shape
}

export class ResizeState implements InteractionState {
  private startMouse: { x: number; y: number } = { x: 0, y: 0 }
  private originalData: Map<string, OriginalNodeShape> = new Map()

  constructor(private handleType: string) {}

  onEnter?(ctx: ToolContext): void {
    const { editor } = ctx
    // Store original node + shape data for all selected (including children of groups)
    editor.selection.getAll().forEach((nodeId) => {
      this.collectOriginalData(nodeId, editor)
    })
  }

  private collectOriginalData(nodeId: string, editor: Editor): void {
    const node = editor.document.getNode(nodeId)
    if (!node) return

    if (isGroupNode(node)) {
      // Recursively collect data from all children
      for (const childId of node.children) {
        this.collectOriginalData(childId, editor)
      }
    } else {
      // It's a shape node
      const shape = editor.document.getShape(nodeId)
      if (shape) {
        this.originalData.set(nodeId, {
          node: JSON.parse(JSON.stringify(node)),
          shape: JSON.parse(JSON.stringify(shape)),
        })
      }
    }
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
      const node = editor.document.getNode(selection[0])

      // Check if it's a group or a single shape
      if (node && isGroupNode(node) && editor.state.selectionBounds) {
        // Group resize: treat like multi-select
        this.resizeMultipleShapes(editor, dx, dy, this.handleType)
      } else {
        // Single shape resize
        const shape = editor.document.getShape(selection[0])
        const original = this.originalData.get(selection[0])
        if (!node || !shape || !original) return

        this.resizeSingleShape(node, shape, original, dx, dy, this.handleType)
        editor.document.updateNode(node)
        editor.document.updateShape(shape)
      }
    } else if (selection.length > 1 && editor.state.selectionBounds) {
      // Multi-shape resize (scale all shapes proportionally)
      this.resizeMultipleShapes(editor, dx, dy, this.handleType)
    }

    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
    ctx.renderOverlays()
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const transforms: import("../../../commands/TransformShapesCommand").TransformData[] = []

    this.originalData.forEach(({ node: oldNode, shape: oldShape }, nodeId) => {
      const newNode = editor.document.getNode(nodeId)
      const newShape = editor.document.getShape(nodeId)
      if (!newNode) return
      transforms.push({
        nodeId,
        oldNode,
        oldShape,
        newNode: JSON.parse(JSON.stringify(newNode)),
        newShape: newShape ? JSON.parse(JSON.stringify(newShape)) : undefined,
      })
    })

    if (transforms.length > 0) {
      editor.commands.execute(
        new TransformShapesCommand(editor, transforms, "resize"),
      )
    }
  }

  private resizeSingleShape(
    node: Node,
    shape: Shape,
    original: OriginalNodeShape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    if (shape.type === "LINE" && original.shape.type === "LINE") {
      this.resizeLine(shape, original.shape, dx, dy, handle)
    } else if (
      (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") &&
      (original.shape.type === "RECTANGLE" || original.shape.type === "ELLIPSE")
    ) {
      this.resizeRectangular(node, shape, original, dx, dy, handle)
    }
  }

  private resizeLine(
    shape: LineShape,
    original: LineShape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    // Simple line resize: just move the endpoints
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
    node: Node,
    shape: RectangleShape | EllipseShape,
    original: OriginalNodeShape,
    dx: number,
    dy: number,
    handle: string,
  ): void {
    const originalShape = original.shape as RectangleShape | EllipseShape
    const rotation = original.node.transform.rotation

    // Transform delta to local space for size changes
    const cos = Math.cos(-rotation)
    const sin = Math.sin(-rotation)
    const localDx = dx * cos - dy * sin
    const localDy = dx * sin + dy * cos

    const cosPos = Math.cos(rotation)
    const sinPos = Math.sin(rotation)

    // Calculate original center in world space
    const origHalfW = originalShape.geometry.width / 2
    const origHalfH = originalShape.geometry.height / 2
    const origCenterX = original.node.transform.x + origHalfW
    const origCenterY = original.node.transform.y + origHalfH

    // Determine new dimensions and anchor point (relative to center)
    let newWidth = originalShape.geometry.width
    let newHeight = originalShape.geometry.height
    let anchorCenterX = 0 // Anchor point relative to original center
    let anchorCenterY = 0

    switch (handle) {
      case "nw": // Top-left corner - bottom-right stays fixed
        newWidth = Math.max(1, originalShape.geometry.width - localDx)
        newHeight = Math.max(1, originalShape.geometry.height - localDy)
        anchorCenterX = origHalfW
        anchorCenterY = origHalfH
        break
      case "ne": // Top-right corner - bottom-left stays fixed
        newWidth = Math.max(1, originalShape.geometry.width + localDx)
        newHeight = Math.max(1, originalShape.geometry.height - localDy)
        anchorCenterX = -origHalfW
        anchorCenterY = origHalfH
        break
      case "se": // Bottom-right corner - top-left stays fixed
        newWidth = Math.max(1, originalShape.geometry.width + localDx)
        newHeight = Math.max(1, originalShape.geometry.height + localDy)
        anchorCenterX = -origHalfW
        anchorCenterY = -origHalfH
        break
      case "sw": // Bottom-left corner - top-right stays fixed
        newWidth = Math.max(1, originalShape.geometry.width - localDx)
        newHeight = Math.max(1, originalShape.geometry.height + localDy)
        anchorCenterX = origHalfW
        anchorCenterY = -origHalfH
        break
      case "n": // Top edge - bottom edge center stays fixed
        newHeight = Math.max(1, originalShape.geometry.height - localDy)
        anchorCenterX = 0
        anchorCenterY = origHalfH
        break
      case "e": // Right edge - left edge center stays fixed
        newWidth = Math.max(1, originalShape.geometry.width + localDx)
        anchorCenterX = -origHalfW
        anchorCenterY = 0
        break
      case "s": // Bottom edge - top edge center stays fixed
        newHeight = Math.max(1, originalShape.geometry.height + localDy)
        anchorCenterX = 0
        anchorCenterY = -origHalfH
        break
      case "w": // Left edge - right edge center stays fixed
        newWidth = Math.max(1, originalShape.geometry.width - localDx)
        anchorCenterX = origHalfW
        anchorCenterY = 0
        break
    }

    // Update shape dimensions
    shape.geometry.width = newWidth
    shape.geometry.height = newHeight

    // Calculate anchor point's absolute world position
    // Transform from center-relative to world space
    const anchorWorldOffsetX = anchorCenterX * cosPos - anchorCenterY * sinPos
    const anchorWorldOffsetY = anchorCenterX * sinPos + anchorCenterY * cosPos
    const anchorWorldX = origCenterX + anchorWorldOffsetX
    const anchorWorldY = origCenterY + anchorWorldOffsetY

    // Calculate where anchor should be relative to new center
    const newHalfW = newWidth / 2
    const newHalfH = newHeight / 2
    let newAnchorCenterX = 0
    let newAnchorCenterY = 0

    switch (handle) {
      case "nw":
        newAnchorCenterX = newHalfW
        newAnchorCenterY = newHalfH
        break
      case "ne":
        newAnchorCenterX = -newHalfW
        newAnchorCenterY = newHalfH
        break
      case "se":
        newAnchorCenterX = -newHalfW
        newAnchorCenterY = -newHalfH
        break
      case "sw":
        newAnchorCenterX = newHalfW
        newAnchorCenterY = -newHalfH
        break
      case "n":
        newAnchorCenterX = 0
        newAnchorCenterY = newHalfH
        break
      case "e":
        newAnchorCenterX = -newHalfW
        newAnchorCenterY = 0
        break
      case "s":
        newAnchorCenterX = 0
        newAnchorCenterY = -newHalfH
        break
      case "w":
        newAnchorCenterX = newHalfW
        newAnchorCenterY = 0
        break
    }

    // Transform new anchor position to world offset
    const newAnchorWorldOffsetX =
      newAnchorCenterX * cosPos - newAnchorCenterY * sinPos
    const newAnchorWorldOffsetY =
      newAnchorCenterX * sinPos + newAnchorCenterY * cosPos

    // Calculate new center position so anchor stays at its world position
    const newCenterX = anchorWorldX - newAnchorWorldOffsetX
    const newCenterY = anchorWorldY - newAnchorWorldOffsetY

    // Calculate new top-left position from new center
    node.transform.x = newCenterX - newHalfW
    node.transform.y = newCenterY - newHalfH
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
  }
}

// Made with Bob
