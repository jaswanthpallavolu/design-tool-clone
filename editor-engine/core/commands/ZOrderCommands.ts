import { Command } from "./Command"
import type { Editor } from "../Editor"

/**
 * Base class for z-order commands
 */
abstract class ZOrderCommand extends Command {
  protected nodeIds: string[] = []
  protected previousIndices: Map<string, number> = new Map()

  constructor(protected editor: Editor) {
    super()
    this.nodeIds = [...this.editor.selection.getAll()]
  }

  protected storePreviousIndices(): void {
    const allNodes = this.editor.document.getAllNodes()
    for (const nodeId of this.nodeIds) {
      const index = allNodes.findIndex((n) => n.id === nodeId)
      if (index !== -1) {
        this.previousIndices.set(nodeId, index)
      }
    }
  }

  undo(): void {
    // Restore previous z-order positions
    for (const [nodeId, index] of this.previousIndices) {
      this.editor.zOrder.setNodeZOrder(nodeId, index)
    }

    // Re-render to show changes
    this.editor.renderer?.renderShapes()

    this.editor.events.emit("document:modified")
  }

  canExecute(): boolean {
    return this.nodeIds.length > 0
  }

  canUndo(): boolean {
    return this.previousIndices.size > 0
  }
}

/**
 * BringToFrontCommand - Bring selected nodes to front
 */
export class BringToFrontCommand extends ZOrderCommand {
  execute(): void {
    this.storePreviousIndices()

    for (const nodeId of this.nodeIds) {
      this.editor.zOrder.bringToFront(nodeId)
    }

    // Re-render to show changes
    this.editor.renderer?.renderShapes()

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Bring ${this.nodeIds.length} node(s) to front`
  }
}

/**
 * SendToBackCommand - Send selected nodes to back
 */
export class SendToBackCommand extends ZOrderCommand {
  execute(): void {
    this.storePreviousIndices()

    for (const nodeId of this.nodeIds) {
      this.editor.zOrder.sendToBack(nodeId)
    }

    // Re-render to show changes
    this.editor.renderer?.renderShapes()

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Send ${this.nodeIds.length} node(s) to back`
  }
}

/**
 * BringForwardCommand - Bring selected nodes one step forward
 */
export class BringForwardCommand extends ZOrderCommand {
  execute(): void {
    this.storePreviousIndices()

    for (const nodeId of this.nodeIds) {
      this.editor.zOrder.bringForward(nodeId)
    }

    // Re-render to show changes
    this.editor.renderer?.renderShapes()

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Bring ${this.nodeIds.length} node(s) forward`
  }
}

/**
 * SendBackwardCommand - Send selected nodes one step backward
 */
export class SendBackwardCommand extends ZOrderCommand {
  execute(): void {
    this.storePreviousIndices()

    for (const nodeId of this.nodeIds) {
      this.editor.zOrder.sendBackward(nodeId)
    }

    // Re-render to show changes
    this.editor.renderer?.renderShapes()

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Send ${this.nodeIds.length} node(s) backward`
  }
}

// Made with Bob
