import { InteractionState } from "./InteractionState"
import { PointerEventData } from "../../../types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { Node, isGroupNode } from "../../../model/Node"
import { Shape } from "../../../model/Shape"
import { Editor } from "../../../Editor"
import { TransformShapesCommand } from "../../../commands"

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
    if (editor.state.selectionBounds) {
      const bounds = editor.state.selectionBounds
      const width = bounds.maxX - bounds.minX
      const height = bounds.maxY - bounds.minY
      this.centerPoint = {
        x: bounds.minX + width / 2,
        y: bounds.minY + height / 2,
      }

      if (selection.length === 1) {
        const node = editor.document.getNode(selection[0])

        // Check if it's a group or single shape
        if (node && isGroupNode(node)) {
          // Group: store transforms for all children recursively (but NOT the group itself)
          for (const childId of node.children) {
            this.collectOriginalTransforms(childId, editor)
          }
        } else {
          // Single shape
          const shape = editor.document.getShape(selection[0])
          if (node && shape) {
            this.originalTransforms.set(node.id, {
              x: node.transform.x,
              y: node.transform.y,
              rotation: node.transform.rotation,
            })
          }
        }
      } else {
        // Multi-select: store original transforms for all nodes
        selection.forEach((nodeId) => {
          this.collectOriginalTransforms(nodeId, editor)
        })
      }
    }
  }

  private collectOriginalTransforms(nodeId: string, editor: Editor): void {
    const node = editor.document.getNode(nodeId)
    if (!node) return

    // Store this node's transform
    this.originalTransforms.set(node.id, {
      x: node.transform.x,
      y: node.transform.y,
      rotation: node.transform.rotation,
    })

    // If it's a group, recursively collect children
    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.collectOriginalTransforms(childId, editor)
      }
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
      const node = editor.document.getNode(selection[0])
      const shape = editor.document.getShape(selection[0])

      // Check if it's a group (no shape)
      if (node && !shape && isGroupNode(node)) {
        // Group rotation: update group's rotation and rotate all children
        const originalGroupRotation = node.transform.rotation
        node.transform.rotation = originalGroupRotation + deltaAngle
        editor.document.updateNode(node)
        this.rotateAllNodes(editor, deltaAngle)
      } else if (node && shape) {
        // Single shape rotation: rotate around its own center
        const original = this.originalTransforms.get(node.id)
        if (original) {
          if (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") {
            // For rectangles and ellipses: only update rotation value
            node.transform.rotation = original.rotation + deltaAngle
          } else if (shape.type === "LINE") {
            // For lines: rotate to follow mouse direction from center
            // Calculate center in world coordinates
            const centerWorldX =
              node.transform.x + (shape.geometry.x1 + shape.geometry.x2) / 2
            const centerWorldY =
              node.transform.y + (shape.geometry.y1 + shape.geometry.y2) / 2

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

            editor.document.updateShape(shape)
          }

          editor.document.updateNode(node)
        }
      }
    } else {
      // Multi-shape rotation: rotate all nodes around selection center
      this.rotateAllNodes(editor, deltaAngle)
    }

    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
    ctx.renderOverlays()
  }

  /**
   * Rotate all nodes that have stored original transforms
   * Used for multi-select and group rotation
   * Both position and rotation are updated - shapes rotate around center AND rotate individually
   */
  private rotateAllNodes(editor: Editor, deltaAngle: number): void {
    this.originalTransforms.forEach((original, nodeId) => {
      const node = editor.document.getNode(nodeId)
      if (node) {
        // Rotate the position around the center point
        const rotatedPos = this.rotatePoint(
          original.x,
          original.y,
          this.centerPoint.x,
          this.centerPoint.y,
          deltaAngle,
        )

        // Update both position and rotation
        node.transform.x = rotatedPos.x
        node.transform.y = rotatedPos.y
        node.transform.rotation = original.rotation + deltaAngle

        editor.document.updateNode(node)
      }
    })
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    // Create command for undo/redo
    const { editor } = ctx
    const transforms: Array<{
      nodeId: string
      newNode: Node
      newShape?: Shape
    }> = []

    // Collect all rotated nodes
    this.originalTransforms.forEach((_, nodeId) => {
      const node = editor.document.getNode(nodeId)
      const shape = editor.document.getShape(nodeId)

      if (node) {
        transforms.push({
          nodeId,
          newNode: JSON.parse(JSON.stringify(node)),
          newShape: shape ? JSON.parse(JSON.stringify(shape)) : undefined,
        })
      }
    })

    if (transforms.length > 0) {
      // Execute command with final state (enables undo/redo)
      editor.commands.execute(
        new TransformShapesCommand(editor, transforms, "rotate"),
      )
    }
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

  private getShapeCenter(node: Node, shape: Shape): { x: number; y: number } {
    // Calculate center from node position + shape dimensions
    if (shape.type === "LINE") {
      const midX = (shape.geometry.x1 + shape.geometry.x2) / 2
      const midY = (shape.geometry.y1 + shape.geometry.y2) / 2
      return {
        x: node.transform.x + midX,
        y: node.transform.y + midY,
      }
    } else {
      return {
        x: node.transform.x + shape.geometry.width / 2,
        y: node.transform.y + shape.geometry.height / 2,
      }
    }
  }
}

// Made with Bob
