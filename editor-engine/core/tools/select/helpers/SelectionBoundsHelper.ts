import { BoundingBoxService, AABB } from "../../../services/BoundingBoxService"
import type { ToolContext } from "../../Tool"

export class SelectionBoundsHelper {
  static updateSelectionBounds(ctx: ToolContext): void {
    const { editor } = ctx
    const selectedShapesAABB: AABB[] = []

    editor.state.selectionBounds = undefined
    editor.selection.getAll().forEach((nodeId) => {
      const node = editor.document.getNode(nodeId)
      const shape = editor.document.getShape(nodeId)
      if (node && shape) {
        selectedShapesAABB.push(BoundingBoxService.getAABB(node, shape))
      }
    })

    if (selectedShapesAABB.length > 0) {
      editor.state.selectionBounds =
        BoundingBoxService.unionAABBs(selectedShapesAABB)
    }
  }

  static clearSelectionBounds(ctx: ToolContext): void {
    ctx.editor.state.selectionBounds = undefined
  }
}
