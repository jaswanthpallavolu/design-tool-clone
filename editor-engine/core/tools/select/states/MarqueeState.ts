import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { AABB } from "@/editor-engine/core/services/BoundingBoxService"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"

export class MarqueeState implements InteractionState {
  private marqueeBox?: AABB
  mouseStart: { x: number; y: number } = { x: 0, y: 0 }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.mouseStart = { x: e.clientX, y: e.clientY }
  }

  onPointerMove(e: PointerEventData, { editor }: ToolContext): void {
    const minX = Math.min(this.mouseStart.x, e.clientX)
    const maxX = Math.max(this.mouseStart.x, e.clientX)
    const minY = Math.min(this.mouseStart.y, e.clientY)
    const maxY = Math.max(this.mouseStart.y, e.clientY)

    this.marqueeBox = {
      minX,
      minY,
      maxX,
      maxY,
    }
    editor.state.marquee = this.marqueeBox
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    if (editor.state.marquee) {
      const marquee = editor.state.marquee

      // Use ShapeQueryService for automatic spatial index optimization
      const shapesInRegion = editor.shapeQuery.findShapesInRegion(
        marquee.minX,
        marquee.minY,
        marquee.maxX,
        marquee.maxY,
      )

      // For each hit shape, resolve its selection candidate using the same
      // parent-promotion logic as hover/click: return the direct parent group
      // unless that ancestor is already being targeted by another hit in this
      // marquee. This means dragging a marquee over some shapes inside a group
      // selects the group, not the individual shapes.
      const candidateIds = new Set<string>()
      for (const node of shapesInRegion) {
        const candidate = this.resolveMarqueeCandidate(node.id, editor)
        candidateIds.add(candidate)
      }

      // Select the resolved nodes
      candidateIds.forEach((id) => {
        editor.selection.select(id)
      })
    }
    this.marqueeBox = undefined
    editor.state.marquee = undefined
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }

  /**
   * Resolve the selection candidate for a marquee-hit shape.
   * Walks up to the root-level ancestor (no parentId) so that marquee selection
   * always picks the top-level node, mirroring a first-click selection.
   */
  private resolveMarqueeCandidate(
    nodeId: string,
    editor: ToolContext["editor"],
  ): string {
    let current = editor.document.getNode(nodeId)
    while (current?.parentId) {
      current = editor.document.getNode(current.parentId)
    }
    return current?.id ?? nodeId
  }
}
