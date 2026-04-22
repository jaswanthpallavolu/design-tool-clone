import { InteractionState } from "./InteractionState"
import { PointerEventData } from "../../../types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { Shape } from "../../../model/Shape"

interface OriginalTransform {
  x: number
  y: number
  rotation: number
}

export class RotateState implements InteractionState {
  private startMouse: { x: number; y: number } = { x: 0, y: 0 }
  private centerPoint: { x: number; y: number } = { x: 0, y: 0 }
  private startAngle: number = 0
  private originalTransforms: Map<string, OriginalTransform> = new Map()

  constructor(private handleType: string) {}

  onEnter?(ctx: ToolContext): void {
    const { editor } = ctx
    const selection = editor.selection.getAll()

    // Calculate center point for rotation
    if (selection.length === 1) {
      const shape = editor.document.getById(selection[0])
      if (shape) {
        this.centerPoint = this.getShapeCenter(shape)
        this.originalTransforms.set(shape.id, {
          x: shape.geometry.x,
          y: shape.geometry.y,
          rotation: shape.geometry.rotation,
        })
      }
    } else if (editor.state.selectionBounds) {
      // Multi-select: rotate around selection bounds center
      const bounds = editor.state.selectionBounds
      this.centerPoint = {
        x: bounds.minX + (bounds.maxX - bounds.minX) / 2,
        y: bounds.minY + (bounds.maxY - bounds.minY) / 2,
      }
      // Store original transforms for all shapes
      selection.forEach((shapeId) => {
        const shape = editor.document.getById(shapeId)
        if (shape) {
          this.originalTransforms.set(shape.id, {
            x: shape.geometry.x,
            y: shape.geometry.y,
            rotation: shape.geometry.rotation,
          })
        }
      })
    }
  }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.startMouse = { x: e.clientX, y: e.clientY }
    this.startAngle = this.calculateAngle(
      this.startMouse.x,
      this.startMouse.y,
      this.centerPoint.x,
      this.centerPoint.y,
    )
  }

  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const currentAngle = this.calculateAngle(
      e.clientX,
      e.clientY,
      this.centerPoint.x,
      this.centerPoint.y,
    )
    const deltaAngle = currentAngle - this.startAngle

    const selection = editor.selection.getAll()

    if (selection.length === 1) {
      // Single shape rotation: rotate around its own center
      const shape = editor.document.getById(selection[0])
      if (shape) {
        const original = this.originalTransforms.get(shape.id)
        if (original) {
          if (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") {
            // For rectangles and ellipses: only update rotation value
            shape.geometry.rotation = original.rotation + deltaAngle
          } else if (shape.type === "LINE") {
            // For lines: rotate to follow mouse direction from center
            // Calculate center in world coordinates
            const centerWorldX =
              shape.geometry.x + (shape.geometry.x1 + shape.geometry.x2) / 2
            const centerWorldY =
              shape.geometry.y + (shape.geometry.y1 + shape.geometry.y2) / 2

            // Calculate the radius (distance from center to endpoint in local space)
            const dx =
              shape.geometry.x1 - (shape.geometry.x1 + shape.geometry.x2) / 2
            const dy =
              shape.geometry.y1 - (shape.geometry.y1 + shape.geometry.y2) / 2
            const radius = Math.sqrt(dx * dx + dy * dy)

            // Calculate angle from mouse to center (in world space)
            const angle = Math.atan2(
              e.clientY - centerWorldY,
              e.clientX - centerWorldX,
            )

            // Calculate center in local space
            const centerLocalX = (shape.geometry.x1 + shape.geometry.x2) / 2
            const centerLocalY = (shape.geometry.y1 + shape.geometry.y2) / 2

            // Position endpoints based on mouse angle
            shape.geometry.x2 = centerLocalX + radius * Math.cos(angle)
            shape.geometry.y2 = centerLocalY + radius * Math.sin(angle)
            shape.geometry.x1 = centerLocalX - radius * Math.cos(angle)
            shape.geometry.y1 = centerLocalY - radius * Math.sin(angle)
          }

          editor.document.update(shape)
        }
      }
    } else {
      // Multi-shape rotation: rotate all shapes around selection center
      selection.forEach((shapeId) => {
        const shape = editor.document.getById(shapeId)
        if (shape) {
          const original = this.originalTransforms.get(shape.id)
          if (original) {
            // Rotate the top-left position around the selection center
            const rotatedPos = this.rotatePoint(
              original.x,
              original.y,
              this.centerPoint.x,
              this.centerPoint.y,
              deltaAngle,
            )

            shape.geometry.x = rotatedPos.x
            shape.geometry.y = rotatedPos.y
            shape.geometry.rotation = original.rotation + deltaAngle

            editor.document.update(shape)
          }
        }
      })
    }

    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
    ctx.renderOverlays()
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    // Rotation complete
  }

  private calculateAngle(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
  ): number {
    return Math.atan2(y - centerY, x - centerX)
  }

  private rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    angle: number,
  ): { x: number; y: number } {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const dx = x - centerX
    const dy = y - centerY

    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    }
  }

  private getShapeCenter(shape: Shape): { x: number; y: number } {
    // Top-left based: calculate center from geometry.x/y + dimensions
    if (shape.type === "LINE") {
      const midX = (shape.geometry.x1 + shape.geometry.x2) / 2
      const midY = (shape.geometry.y1 + shape.geometry.y2) / 2
      return {
        x: shape.geometry.x + midX,
        y: shape.geometry.y + midY,
      }
    } else {
      return {
        x: shape.geometry.x + shape.geometry.width / 2,
        y: shape.geometry.y + shape.geometry.height / 2,
      }
    }
  }
}

// Made with Bob
