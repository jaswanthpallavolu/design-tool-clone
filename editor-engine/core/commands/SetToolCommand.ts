import { Command } from "./Command"
import type { Editor } from "../Editor"

/**
 * SetToolCommand - Command to change the active tool
 */
export class SetToolCommand extends Command {
  private oldToolId: string

  constructor(
    private editor: Editor,
    private newToolId: string,
  ) {
    super()
    this.oldToolId = editor.tools.getActive()?.id || ""
  }

  execute(): void {
    this.editor.tools.setActive(this.newToolId)
    this.editor.events.emit("tool:changed", { toolId: this.newToolId })
  }

  undo(): void {
    if (this.oldToolId) {
      this.editor.tools.setActive(this.oldToolId)
      this.editor.events.emit("tool:changed", { toolId: this.oldToolId })
    }
  }

  describe(): string {
    return `Set tool to ${this.newToolId}`
  }

  canUndo(): boolean {
    return !!this.oldToolId
  }

  isUndoable(): boolean {
    return false
  }
}

// Made with Bob
