import { Command } from "./Command"
import type { Editor } from "../Editor"

/**
 * GroupCommand - Command to group selected nodes
 */
export class GroupCommand extends Command {
  private groupId: string | null = null
  private selectedIds: string[] = []
  private originalParents: Map<string, string | undefined> = new Map()

  constructor(private editor: Editor) {
    super()
    // Store the current selection
    this.selectedIds = [...this.editor.selection.getAll()]
  }

  execute(): void {
    // Group the nodes
    const result = this.editor.groupService.groupNodes(this.selectedIds)

    if (result) {
      this.groupId = result.groupId
      this.originalParents = result.originalParents

      // Select the newly created group
      this.editor.selection.setSingle(this.groupId)
    }

    this.editor.events.emit("document:modified")
  }

  undo(): void {
    if (!this.groupId) return

    // Get the children before ungrouping
    const groupNode = this.editor.document.getNode(this.groupId)
    if (!groupNode) return

    const childIds = [...(groupNode.children || [])]

    // Restore each child to its original parent BEFORE removing the group
    for (const childId of childIds) {
      const originalParent = this.originalParents.get(childId)
      this.editor.document.reparent(childId, originalParent)
    }

    // Now remove the group node (after children are moved out)
    this.editor.document.removeNode(this.groupId)

    // Restore the original selection
    this.editor.selection.setMany(this.selectedIds)

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
