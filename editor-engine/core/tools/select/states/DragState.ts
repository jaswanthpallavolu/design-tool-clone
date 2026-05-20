import { InteractionState } from "./InteractionState"
import { PointerEventData } from "@/editor-engine/core/types/InputTypes"
import { ToolContext } from "../../Tool"
import { SelectionBoundsHelper } from "../helpers/SelectionBoundsHelper"
import { isGroupNode, Node } from "../../../model/Node"
import { TransformShapesCommand } from "../../../commands"
import { Shape } from "../../../model/Shape"

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

    this.hasMoved = true

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

  onPointerUp(e: PointerEventData, ctx: ToolContext): void {
    // If shapes were moved, create a command for undo/redo
    if (this.hasMoved) {
      const { editor } = ctx
      const transforms: Array<{
        nodeId: string
        newNode: Node
        newShape?: Shape
      }> = []

      // Collect all moved nodes and their current state
      editor.selection.getAll().forEach((nodeId) => {
        this.collectTransformedNodes(nodeId, editor, transforms)
      })

      if (transforms.length > 0) {
        // Execute command with final state (enables undo/redo)
        editor.commands.execute(
          new TransformShapesCommand(editor, transforms, "move"),
        )
      }
    }
  }

  /**
   * Collect all transformed nodes recursively (including group children)
   */
  private collectTransformedNodes(
    nodeId: string,
    editor: ToolContext["editor"],
    transforms: Array<{ nodeId: string; newNode: Node; newShape?: Shape }>,
  ): void {
    const node = editor.document.getNode(nodeId)
    if (!node) return

    if (isGroupNode(node)) {
      // For groups, collect all children recursively
      for (const childId of node.children) {
        this.collectTransformedNodes(childId, editor, transforms)
      }
    } else {
      // For shapes, add to transforms
      const shape = editor.document.getShape(nodeId)
      transforms.push({
        nodeId,
        newNode: JSON.parse(JSON.stringify(node)),
        newShape: shape ? JSON.parse(JSON.stringify(shape)) : undefined,
      })
    }
  }
}
