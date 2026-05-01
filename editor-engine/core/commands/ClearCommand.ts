import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { Node } from "../model/Node"

/**
 * ClearCommand - Command to clear all shapes from the document
 */
export class ClearCommand extends Command {
  private savedNodes: Node[] = []
  private savedSelection: string[] = []

  constructor(private editor: Editor) {
    super()
  }

  execute(): void {
    // Save current state before clearing
    this.savedNodes = [...this.editor.document.getAllNodes()]
    this.savedSelection = [...this.editor.selection.getAll()]

    // Clear everything
    this.editor.document.clear()
    this.editor.selection.clear()
    this.editor.state.clearTransient()
    this.editor.renderer?.clear()

    this.editor.events.emit("document:cleared")
  }

  undo(): void {
    // Restore saved nodes
    this.savedNodes.forEach((node) => {
      this.editor.document.addNode(node)
    })

    // Restore selection
    if (this.savedSelection.length > 0) {
      this.editor.selection.setMany(this.savedSelection)
    }

    this.editor.events.emit("document:restored", {
      nodeCount: this.savedNodes.length,
    })
  }

  describe(): string {
    return `Clear document (${this.savedNodes.length} nodes)`
  }

  canUndo(): boolean {
    return this.savedNodes.length > 0
  }
}

// Made with Bob
