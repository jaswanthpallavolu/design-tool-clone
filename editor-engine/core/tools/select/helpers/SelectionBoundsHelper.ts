import { BoundingBoxService, AABB } from "../../../services/BoundingBoxService"
import { isGroupNode } from "../../../model/Node"
import type { ToolContext } from "../../Tool"

export class SelectionBoundsHelper {
  static updateSelectionBounds(ctx: ToolContext): void {
    const { editor } = ctx
    const selection = editor.selection.getAll()

    editor.state.selectionBounds = undefined

    // Calculate AABB for all selected nodes
    const selectedShapesAABB: AABB[] = []
    selection.forEach((nodeId) => {
      const node = editor.document.getNode(nodeId)
      if (!node) return

      if (isGroupNode(node)) {
        this.collectGroupAABBs(nodeId, editor, selectedShapesAABB)
      } else {
        const shape = editor.document.getShape(nodeId)
        if (shape) {
          selectedShapesAABB.push(BoundingBoxService.getAABB(node, shape))
        }
      }
    })

    if (selectedShapesAABB.length > 0) {
      editor.state.selectionBounds =
        BoundingBoxService.unionAABBs(selectedShapesAABB)
    }
  }

  /**
   * Recursively collect AABBs from all shape nodes within a group
   */
  private static collectGroupAABBs(
    groupId: string,
    editor: ToolContext["editor"],
    aabbs: AABB[],
  ): void {
    const group = editor.document.getNode(groupId)
    if (!group || !isGroupNode(group)) return

    for (const childId of group.children) {
      const child = editor.document.getNode(childId)
      if (!child) continue

      if (isGroupNode(child)) {
        // Recursively collect from nested groups
        this.collectGroupAABBs(childId, editor, aabbs)
      } else {
        // It's a shape node
        const shape = editor.document.getShape(childId)
        if (shape) {
          aabbs.push(BoundingBoxService.getAABB(child, shape))
        }
      }
    }
  }

  static clearSelectionBounds(ctx: ToolContext): void {
    ctx.editor.state.selectionBounds = undefined
  }
}
