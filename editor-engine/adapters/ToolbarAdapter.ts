// adapters/ToolbarAdapter.ts

import { Editor } from "../core/Editor"
import { SelectTool } from "../core/tools/SelectTool"

/**
 * ToolbarAdapter is responsible for:
 * 1. Registering available tools with the ToolManager
 * 2. Handling UI toolbar interactions
 * 3. Activating tools based on user selection
 */
export class ToolbarAdapter {
  constructor(private readonly editor: Editor) {
    this.registerTools()
  }

  /**
   * Register all available tools with the editor
   * This is where tools are added to the ToolManager
   */
  private registerTools(): void {
    // Register the select tool
    this.editor.tools.register(new SelectTool())

    // Additional tools can be registered here as they are created
    // Example:
    // this.editor.tools.register(new RectangleTool())
    // this.editor.tools.register(new CircleTool())
    // this.editor.tools.register(new PanTool())
  }

  /**
   * Activate a tool by its ID
   * This would typically be called when a user clicks a toolbar button
   */
  activateTool(toolId: string): void {
    this.editor.tools.setActive(toolId)
  }

  /**
   * Get the currently active tool ID
   */
  getActiveTool(): string | undefined {
    return this.editor.tools.getActive()?.id
  }
}

// Made with Bob
