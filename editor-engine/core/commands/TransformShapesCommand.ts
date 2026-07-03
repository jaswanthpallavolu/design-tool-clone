import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"
import type { Shape } from "../model/Shape"
import { BoundingBoxService } from "../services/BoundingBoxService"
import { isGroupNode } from "../model/Node"

export interface TransformData {
  nodeId: string
  oldNode: Node
  oldShape?: Shape
  newNode: Node
  newShape?: Shape
}

/**
 * TransformShapesCommand - Command for move, resize, and rotate operations
 * Supports undo/redo for shape transformations.
 *
 * Two construction modes:
 *   1. Pass `newOnly` entries → old state is snapshotted from the document NOW
 *      (only correct when the document still holds the pre-change state).
 *   2. Pass `TransformData` entries (with oldNode already set) → used when the
 *      caller has already mutated the document and holds its own pre-change snapshot.
 */
export class TransformShapesCommand extends Command {
  private transforms: TransformData[] = []
  private operationType: "move" | "resize" | "rotate"

  constructor(
    private editor: Editor,
    transforms: Array<
      | TransformData
      | { nodeId: string; newNode: Node; newShape?: Shape }
    >,
    operationType: "move" | "resize" | "rotate" = "move",
  ) {
    super()
    this.operationType = operationType

    transforms.forEach((entry) => {
      if ("oldNode" in entry) {
        // Caller supplied both old and new — use as-is.
        this.transforms.push(entry as TransformData)
      } else {
        // Snapshot old state from the document right now.
        const { nodeId, newNode, newShape } = entry
        const oldNode = editor.document.getNode(nodeId)
        const oldShape = editor.document.getShape(nodeId)
        if (oldNode) {
          this.transforms.push({
            nodeId,
            oldNode: JSON.parse(JSON.stringify(oldNode)),
            oldShape: oldShape ? JSON.parse(JSON.stringify(oldShape)) : undefined,
            newNode,
            newShape,
          })
        }
      }
    })
  }

  execute(): void {
    this.transforms.forEach(({ newNode, newShape }) => {
      this.editor.document.updateNode(newNode)
      if (newShape) this.editor.document.updateShape(newShape)
    })
    this.refreshSelectionBounds()
    this.editor.renderer?.renderShapes()
    this.editor.events.emit("document:modified")
  }

  undo(): void {
    this.transforms.forEach(({ oldNode, oldShape }) => {
      this.editor.document.updateNode(oldNode)
      if (oldShape) this.editor.document.updateShape(oldShape)
    })
    this.refreshSelectionBounds()
    this.editor.renderer?.renderShapes()
    this.editor.events.emit("document:modified")
  }

  /**
   * Recompute editor.state.selectionBounds from the current document state so
   * that selection handles render at the correct position after undo/redo.
   */
  private refreshSelectionBounds(): void {
    const selection = this.editor.selection.getAll()
    this.editor.state.selectionBounds = undefined
    if (selection.length === 0) return

    const aabbs = selection.flatMap((nodeId) =>
      this.collectAABBs(nodeId),
    )
    if (aabbs.length > 0) {
      this.editor.state.selectionBounds = BoundingBoxService.unionAABBs(aabbs)
    }
  }

  private collectAABBs(nodeId: string): ReturnType<typeof BoundingBoxService.getAABB>[] {
    const node = this.editor.document.getNode(nodeId)
    if (!node) return []
    if (isGroupNode(node)) {
      return node.children.flatMap((childId) => this.collectAABBs(childId))
    }
    const shape = this.editor.document.getShape(nodeId)
    return shape ? [BoundingBoxService.getAABB(node, shape)] : []
  }

  describe(): string {
    const count = this.transforms.length
    return `${this.operationType.charAt(0).toUpperCase() + this.operationType.slice(1)} ${count} shape(s)`
  }

  canExecute(): boolean {
    return this.transforms.length > 0
  }

  canUndo(): boolean {
    return this.transforms.length > 0
  }
}

// Made with Bob
