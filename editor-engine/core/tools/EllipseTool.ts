import { Tool, ToolContext } from "./Tool"
import { ShapeType, createEllipseShape } from "../model/Shape"
import { createShapeNode } from "../model/Node"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"

export class EllipseTool implements Tool {
  readonly id = "ellipse"
  draftNodeId?: string
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }
  hasDragged = false

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.hasDragged = false

    // Create node ID
    const nodeId = crypto.randomUUID()
    this.draftNodeId = nodeId

    // Create node with transform
    const node = createShapeNode(
      nodeId,
      {
        x: this.mouseStart.x,
        y: this.mouseStart.y,
        rotation: 0,
      },
      {
        existingNodes: editor.document.getAllNodes(),
        existingShapes: editor.document.getShapesMap(),
        shapeType: ShapeType.ELLIPSE,
      },
    )

    // Create shape with geometry
    const shape = createEllipseShape(
      nodeId,
      {
        width: 0,
        height: 0,
      },
      {
        fillColor: editor.state.toolOptions.fillColor,
        strokeColor: editor.state.toolOptions.strokeColor,
      },
    )

    // Add to document
    editor.document.addNode(node)
    editor.document.addShape(shape)
    editor.selection.setSingle(nodeId)
  }

  onPointerMove(e: PointerEventData, { editor, renderOverlays }: ToolContext) {
    if (!this.draftNodeId) return

    const node = editor.document.getNode(this.draftNodeId)
    const shape = editor.document.getShape(this.draftNodeId)
    if (!node || !shape || shape.type !== ShapeType.ELLIPSE) return

    const minX = Math.min(this.mouseStart.x, e.clientX)
    const minY = Math.min(this.mouseStart.y, e.clientY)
    const maxX = Math.max(this.mouseStart.x, e.clientX)
    const maxY = Math.max(this.mouseStart.y, e.clientY)
    const width = maxX - minX
    const height = maxY - minY

    if (width === 0 && height === 0) return

    this.hasDragged = true

    // Update node position (top-left corner)
    node.transform.x = minX
    node.transform.y = minY

    // Update shape geometry
    shape.geometry.width = width
    shape.geometry.height = height

    editor.document.updateNode(node)
    editor.document.updateShape(shape)
    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays })
    renderOverlays()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext) {
    if (this.draftNodeId) {
      if (!this.hasDragged) {
        editor.document.removeNode(this.draftNodeId)
        editor.selection.clear()
        editor.renderer?.renderShapes()
        this.draftNodeId = undefined
        this.hasDragged = false
        return
      }
      this.draftNodeId = undefined
      this.hasDragged = false
      editor.setActiveTool("select")
    }
  }
}

// Made with Bob
