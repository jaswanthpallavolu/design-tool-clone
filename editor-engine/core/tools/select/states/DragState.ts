import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { isGroupNode } from "../../../model/Node"

export class DragState implements InteractionState {
  prevMouseX: number = 0
  prevMouseY: number = 0

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
  }
  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const deltaX = e.clientX - this.prevMouseX
    const deltaY = e.clientY - this.prevMouseY

    editor.selection.getAll().forEach((nodeId) => {
      const node = editor.document.getNode(nodeId)
      if (!node) return

      // If it's a group, move the entire hierarchy
      if (isGroupNode(node)) {
        this.moveNodeRecursive(nodeId, deltaX, deltaY, editor)
      } else {
        // If it's a shape, just move it (don't move siblings)
        node.transform.x += deltaX
        node.transform.y += deltaY
        editor.document.updateNode(node)
      }
    })

    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
    editor.renderer?.renderShapes()
    SelectionBoundsHelper.updateSelectionBounds(ctx)
  }

  /**
   * Move a node and all its children recursively (for groups)
   */
  private moveNodeRecursive(
    nodeId: string,
    deltaX: number,
    deltaY: number,
    editor: ToolContext["editor"],
  ): void {
    const node = editor.document.getNode(nodeId)
    if (!node) return

    // Move the node itself
    node.transform.x += deltaX
    node.transform.y += deltaY
    editor.document.updateNode(node)

    // If it's a group, move all children recursively
    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.moveNodeRecursive(childId, deltaX, deltaY, editor)
      }
    }
  }

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {}
}
