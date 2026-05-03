import { Command } from "./Command"
import type { Editor } from "../Editor"

/**
 * GroupCommand - Command to group selected nodes
 */
export class GroupCommand extends Command {
  private groupId: string | null = null
  private selectedIds: string[] = []

  constructor(private editor: Editor) {
    super()
    // Store the current selection
    this.selectedIds = [...this.editor.selection.getAll()]
  }

  execute(): void {
    // Group the nodes
    this.groupId = this.editor.groupService.groupNodes(this.selectedIds)

    if (this.groupId) {
      // Select the newly created group
      this.editor.selection.setSingle(this.groupId)
    }

    this.editor.events.emit("document:modified")
  }

  undo(): void {
    if (!this.groupId) return

    // Ungroup the node
    const childIds = this.editor.groupService.ungroupNode(this.groupId)

    if (childIds) {
      // Restore the original selection
      this.editor.selection.setMany(this.selectedIds)
    }

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Group ${this.selectedIds.length} nodes`
  }

  canExecute(): boolean {
    return this.editor.groupService.canGroup(this.selectedIds)
  }

  canUndo(): boolean {
    return this.groupId !== null
  }
}

// Made with Bob
