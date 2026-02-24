import { Tool, ToolContext } from "./Tool"
import { RectangleShape } from "../model/Shape"
import { BoundingBoxService, AABB } from "../services/BoundingBoxService"
import type { PointerEventData } from "../types/InputTypes"

export class SelectTool implements Tool {
  readonly id = "select"
  private draft?: RectangleShape

  onPointerDown(e: PointerEventData, { editor }: ToolContext): void {
    if (editor.state.hoveredShapeId) {
      if (e.shiftKey) editor.selection.select(editor.state.hoveredShapeId)
      else editor.selection.setSingle(editor.state.hoveredShapeId)
    } else {
      editor.selection.clear()
      editor.state.clearTransient()
      // Start Drawing the marquee
      this.draft = {
        id: crypto.randomUUID(),
        kind: "rectangle",
        p1: { x: e.clientX, y: e.clientY },
        rotation: 0,
        width: 0,
        height: 0,
        fillStyle: "",
        strokeStyle: "",
      }
    }
  }

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    // marquee logic
    if (editor.selection.isEmpty() && this.draft) {
      const width = e.clientX - this.draft.p1.x
      const height = e.clientY - this.draft.p1.y
      this.draft.width = width
      this.draft.height = height
      editor.state.marquee = BoundingBoxService.getAABB(this.draft)
    }

    let hoveringOnShape = false
    if (editor.state.hoveredShapeId && !this.draft) {
      const hoveredShape = editor.document.getById(editor.state.hoveredShapeId)
      if (
        hoveredShape &&
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(hoveredShape, e.clientX, e.clientY)
      ) {
        hoveringOnShape = true
      }
    }
    if (!hoveringOnShape && !this.draft) {
      editor.state.hoveredShapeId = editor.document
        .getAll()
        .find((shape) =>
          editor.renderer
            ?.getHitTestAdapter()
            ?.testShape(shape, e.clientX, e.clientY),
        )?.id
    }

    editor.renderer?.clearSelectionBox()
    editor.renderer?.renderHoverOutline()
    editor.renderer?.renderSelectionBox()
    editor.renderer?.renderSelectionBounds()
  }

  onPointerUp(e: PointerEventData, { editor }: ToolContext): void {
    if (editor.state.marquee) {
      const marquee = editor.state.marquee ?? {}
      editor.document.getAll().forEach((shape) => {
        const intersect =
          shape.kind === "line"
            ? BoundingBoxService.lineIntersectsAABB(
                shape.p1.x,
                shape.p1.y,
                shape.p2.x,
                shape.p2.y,
                marquee,
              )
            : BoundingBoxService.aabbIntersects(
                marquee,
                BoundingBoxService.getAABB(shape),
              )
        if (intersect) {
          editor.selection.select(shape.id)
        }
      })
    }

    this.draft = undefined
    editor.state.marquee = undefined
    const selectedShapesAABB: AABB[] = []
    editor.state.selectionBounds = undefined
    editor.selection.getAll().forEach((shapeId) => {
      const shape = editor.document.getById(shapeId)
      if (shape) selectedShapesAABB.push(BoundingBoxService.getAABB(shape))
    })
    if (selectedShapesAABB.length > 0) {
      editor.state.selectionBounds =
        BoundingBoxService.unionAABBs(selectedShapesAABB)
    }

    editor.renderer?.clearSelectionBox()
    editor.renderer?.renderHoverOutline()
    editor.renderer?.renderSelectionBox()
    editor.renderer?.renderSelectionBounds()
  }
}
