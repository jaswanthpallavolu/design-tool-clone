import { Command } from "./Command"
import type { Editor } from "../Editor"

/**
 * UngroupCommand - Command to ungroup selected group nodes
 */
export class UngroupCommand extends Command {
  private ungroupedData: Array<{
    groupId: string
    childIds: string[]
  }> = []
  private selectedIds: string[] = []

  constructor(private editor: Editor) {
    super()
    // Store the current selection
    this.selectedIds = [...this.editor.selection.getAll()]
  }

  execute(): void {
    this.ungroupedData = []

    // Handle single or multiple group selections
    for (const id of this.selectedIds) {
      if (this.editor.groupService.canUngroup(id)) {
        const childIds = this.editor.groupService.ungroupNode(id)
        if (childIds) {
          this.ungroupedData.push({ groupId: id, childIds })
        }
      }
    }

    if (this.ungroupedData.length > 0) {
      // Select all ungrouped children
      const allChildIds = this.ungroupedData.flatMap((data) => data.childIds)
      this.editor.selection.setMany(allChildIds)
    }

    this.editor.events.emit("document:modified")
  }

  undo(): void {
    if (this.ungroupedData.length === 0) return

    const newGroupIds: string[] = []

    // Re-group each set of children
    for (const { childIds } of this.ungroupedData) {
      const groupId = this.editor.groupService.groupNodes(childIds)
      if (groupId) {
        newGroupIds.push(groupId)
      }
    }

    if (newGroupIds.length > 0) {
      // Restore selection to the re-created groups
      this.editor.selection.setMany(newGroupIds)
    }

    this.editor.events.emit("document:modified")
  }

  describe(): string {
    return `Ungroup ${this.selectedIds.length} group(s)`
  }

  canExecute(): boolean {
    // At least one selected node must be a group
    return this.selectedIds.some((id) =>
      this.editor.groupService.canUngroup(id),
    )
  }

  canUndo(): boolean {
    return this.ungroupedData.length > 0
  }
}

// Made with Bob
