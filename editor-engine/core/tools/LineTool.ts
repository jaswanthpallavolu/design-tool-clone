import { ToolContext } from "./Tool"
import { ShapeType, createLineShape } from "../model/Shape"
import { createShapeNode } from "../model/Node"
import type { PointerEventData } from "../types/InputTypes"
import { SelectionBoundsHelper } from "./select/helpers/SelectionBoundsHelper"
import { BaseShapeTool } from "./BaseShapeTool"
import { TOOL_IDS } from "./ToolConstants"

export class LineTool extends BaseShapeTool {
  readonly id = TOOL_IDS.LINE
  private mouseStart: { x: number; y: number } = { x: 0, y: 0 }

  onPointerDown(e: PointerEventData, { editor }: ToolContext) {
    this.mouseStart = { x: e.clientX, y: e.clientY }
    this.hasDragged = false

    // Create node ID
    const nodeId = crypto.randomUUID()
    this.draftNodeId = nodeId

    // Create node with transform (start at mouse position)
    const node = createShapeNode(
      nodeId,
      {
        x: e.clientX,
        y: e.clientY,
        rotation: 0,
      },
      {
        existingNodes: editor.document.getAllNodes(),
        existingShapes: editor.document.getShapesMap(),
        shapeType: ShapeType.LINE,
      },
    )

    // Create shape with geometry (line endpoints relative to node position)
    const shape = createLineShape(
      nodeId,
      {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        lineWidth: 4,
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
    if (!node || !shape || shape.type !== ShapeType.LINE) return

    const nextX2 = e.clientX - node.transform.x
    const nextY2 = e.clientY - node.transform.y

    if (nextX2 === 0 && nextY2 === 0) return

    this.hasDragged = true

    // Update shape geometry (x2/y2 relative to node position)
    shape.geometry.x2 = nextX2
    shape.geometry.y2 = nextY2

    editor.document.updateNode(node)
    editor.document.updateShape(shape)
    editor.renderer?.renderShapes()

    SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays })
    renderOverlays()
  }

  // onPointerUp inherited from BaseShapeTool
}
