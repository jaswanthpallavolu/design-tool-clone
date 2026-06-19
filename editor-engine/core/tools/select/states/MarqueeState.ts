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

      // Get the IDs of shapes in the region
      const shapeIds = shapesInRegion.map((node) => node.id)

      // Normalize selection: if all shapes in a group are selected, select the group instead
      const normalizedIds = this.normalizeSelectionForGroups(shapeIds, editor)

      // Select the normalized nodes (groups or individual shapes)
      normalizedIds.forEach((id) => {
        editor.selection.select(id)
      })
    }
    this.marqueeBox = undefined
    editor.state.marquee = undefined
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }

  /**
   * Normalize selection: if all shapes in a group are selected, select the group instead
   */
  private normalizeSelectionForGroups(
    shapeIds: string[],
    editor: ToolContext["editor"],
  ): string[] {
    const selectedSet = new Set(shapeIds)
    const toRemove = new Set<string>()
    const toAdd = new Set<string>()

    // Check each group in the document
    for (const node of editor.document.getAllNodes()) {
      if (node.type !== "GROUP") continue

      // Get all leaf shape IDs in this group
      const leafShapeIds = this.getLeafShapeIds(node.id, editor)
      if (leafShapeIds.length === 0) continue

      // Check if all leaf shapes in this group are selected
      const allLeavesSelected = leafShapeIds.every((id) => selectedSet.has(id))

      // If all leaves are selected but the group itself is not, replace leaves with group
      if (allLeavesSelected && !selectedSet.has(node.id)) {
        toAdd.add(node.id)
        for (const id of leafShapeIds) {
          toRemove.add(id)
        }
      }
    }

    // Build the final result: original selection minus removed shapes, plus added groups
    const result = [...selectedSet].filter((id) => !toRemove.has(id))
    for (const id of toAdd) {
      result.push(id)
    }
    return result
  }

  /**
   * Get all leaf shape IDs within a node (recursively for groups)
   */
  private getLeafShapeIds(
    nodeId: string,
    editor: ToolContext["editor"],
  ): string[] {
    const result: string[] = []
    const stack = [nodeId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      const node = editor.document.getNode(currentId)
      if (!node) continue

      if (node.type === "GROUP") {
        // Add children to stack (in reverse to maintain order)
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i])
        }
      } else if (editor.document.getShape(currentId)) {
        result.push(currentId)
      }
    }

    return result
  }
}
