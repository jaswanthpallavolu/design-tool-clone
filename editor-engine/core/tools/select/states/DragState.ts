import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { isGroupNode, Node } from "../../../model/Node"
import {
  TransformShapesCommand,
  UpdateToolOptionsCommand,
} from "../../../commands"
import { Shape } from "../../../model/Shape"
import { TransformData } from "../../../commands/TransformShapesCommand"

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
  private movedNodes: Map<string, { node: Node; shape?: Shape }> = new Map()
  private hasMoved = false

  /**
   * Returns the set of selected node IDs that are true drag roots — i.e. nodes
   * whose ancestor is NOT also in the selection. Moving only these (recursively)
   * prevents double-moving children that are selected alongside their parent group.
   */
  private getDragRoots(editor: ToolContext["editor"]): Set<string> {
    const selected = new Set(editor.selection.getAll())
    const roots = new Set<string>()
    for (const nodeId of selected) {
      let node = editor.document.getNode(nodeId)
      let isDescendantOfSelected = false
      // Walk up via parentId to check if any ancestor is also selected
      while (node?.parentId) {
        if (selected.has(node.parentId)) {
          isDescendantOfSelected = true
          break
        }
        node = editor.document.getNode(node.parentId)
      }
      if (!isDescendantOfSelected) roots.add(nodeId)
    }
    return roots
  }

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

    // Snapshot pre-drag state for every node that will be moved.
    // Only snapshot drag roots (and their descendants) to avoid double-counting.
    this.movedNodes.clear()
    this.getDragRoots(ctx.editor).forEach((nodeId) => {
      this.snapshotNodeRecursive(nodeId, ctx.editor)
    })
  }

  /**
   * Deep-snapshot a node (and its children if it is a group) into movedNodes.
   */
  private snapshotNodeRecursive(
    nodeId: string,
    editor: ToolContext["editor"],
  ): void {
    const node = editor.document.getNode(nodeId)
    if (!node) return
    this.movedNodes.set(nodeId, {
      node: JSON.parse(JSON.stringify(node)),
      shape: editor.document.getShape(nodeId)
        ? JSON.parse(JSON.stringify(editor.document.getShape(nodeId)))
        : undefined,
    })
    if (isGroupNode(node)) {
      for (const childId of node.children) {
        this.snapshotNodeRecursive(childId, editor)
      }
    }
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

    // Update tool options from the selected shape's style
    this.updateToolOptionsFromSelection(editor, nodeToSelect)
  }

  /**
   * Update tool options (strokeColor, fillColor) from the selected shape's style
   */
  private updateToolOptionsFromSelection(
    editor: ToolContext["editor"],
    nodeId: string,
  ): void {
    const shape = editor.document.getShape(nodeId)
    console.log(
      "🔍 DragState - updateToolOptionsFromSelection - nodeId:",
      nodeId,
      "shape:",
      shape,
    )
    if (shape) {
      console.log(
        "🎨 DragState - Executing UpdateToolOptionsCommand with colors:",
        {
          strokeColor: shape.style.strokeColor,
          fillColor: shape.style.fillColor,
        },
      )
      editor.commands.execute(
        new UpdateToolOptionsCommand(editor, {
          strokeColor: shape.style.strokeColor,
          fillColor: shape.style.fillColor,
        }),
      )
    }
  }
  onPointerMove(e: PointerEventData, ctx: ToolContext): void {
    const { editor } = ctx
    const deltaX = e.clientX - this.prevMouseX
    const deltaY = e.clientY - this.prevMouseY

    this.hasMoved = true

    // Move only drag roots — children are handled recursively inside moveNodeRecursive
    this.getDragRoots(editor).forEach((nodeId) => {
      this.moveNodeRecursive(nodeId, deltaX, deltaY, editor)
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

  onPointerUp(_e: PointerEventData, ctx: ToolContext): void {
    // If shapes were moved, create a command for undo/redo
    if (this.hasMoved) {
      const { editor } = ctx

      // Build transform entries using the pre-drag snapshots captured in
      // onPointerDown so undo restores the correct original positions.
      const transforms: TransformData[] = []
      this.movedNodes.forEach(({ node: oldNode, shape: oldShape }, nodeId) => {
        const newNode = editor.document.getNode(nodeId)
        const newShape = editor.document.getShape(nodeId)
        if (!newNode) return
        transforms.push({
          nodeId,
          oldNode,
          oldShape,
          newNode: JSON.parse(JSON.stringify(newNode)),
          newShape: newShape ? JSON.parse(JSON.stringify(newShape)) : undefined,
        })
      })

      if (transforms.length > 0) {
        editor.commands.execute(
          new TransformShapesCommand(editor, transforms, "move"),
        )
      }
    }
  }
}
