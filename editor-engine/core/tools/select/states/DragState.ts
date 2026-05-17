import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { isGroupNode } from "../../../model/Node"

/**
 * Selection context for DragState
 * Used when a new object is being selected before dragging
 */
interface SelectionContext {
  nodeToSelect: string
  shouldAddToSelection: boolean
}

export class DragState implements InteractionState {
  prevMouseX: number = 0
  prevMouseY: number = 0
  private selectionContext?: SelectionContext

  constructor(selectionContext?: SelectionContext) {
    this.selectionContext = selectionContext
  }

  onPointerDown(e: PointerEventData, ctx: ToolContext): void {
    // Apply selection if context is provided (from HoveredObjectResolver)
    if (this.selectionContext) {
      this.applySelection(ctx)
    }

    this.prevMouseX = e.clientX
    this.prevMouseY = e.clientY
  }

  /**
   * Apply selection based on the provided context
   * This separates the concern of selection from the resolver
   */
  private applySelection(ctx: ToolContext): void {
    if (!this.selectionContext) return

    const { nodeToSelect, shouldAddToSelection } = this.selectionContext
    const { editor } = ctx

    if (shouldAddToSelection) {
      editor.selection.select(nodeToSelect)
    } else {
      editor.selection.setSingle(nodeToSelect)
    }

    // Update selection bounds after selection change
    SelectionBoundsHelper.updateSelectionBounds(ctx)
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
