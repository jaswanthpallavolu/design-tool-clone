import { Command } from "./Command"
import type { Editor } from "../Editor"
import type { ToolOptions } from "../EditorState"

/**
 * UpdateToolOptionsCommand - Command to update tool options (colors, etc.)
 */
export class UpdateToolOptionsCommand extends Command {
  private oldOptions: Partial<ToolOptions>

  constructor(
    private editor: Editor,
    private newOptions: Partial<ToolOptions>,
  ) {
    super()
    // Save current options for undo
    this.oldOptions = {}
    Object.keys(newOptions).forEach((key) => {
      const optionKey = key as keyof ToolOptions
      this.oldOptions[optionKey] = this.editor.state.toolOptions[optionKey]
    })
  }

  execute(): void {
    this.editor.state.updateToolOptions(this.newOptions)
    this.editor.events.emit("tool:options:changed", {
      options: this.newOptions,
    })
  }

  undo(): void {
    this.editor.state.updateToolOptions(this.oldOptions)
    this.editor.events.emit("tool:options:changed", {
      options: this.oldOptions,
    })
  }

  describe(): string {
    const changes = Object.entries(this.newOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ")
    return `Update tool options: ${changes}`
  }

  isUndoable(): boolean {
    return false
  }
}

// Made with Bob
