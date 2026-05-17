import { Tool, ToolContext } from "./Tool"
import type { PointerEventData } from "../types/InputTypes"
import { TOOL_IDS } from "./ToolConstants"

/**
 * Base class for shape creation tools that share common draft management logic
 */
export abstract class BaseShapeTool implements Tool {
  abstract readonly id: string
  protected draftNodeId?: string
  protected hasDragged = false

  abstract onPointerDown(e: PointerEventData, ctx: ToolContext): void
  abstract onPointerMove(e: PointerEventData, ctx: ToolContext): void

  onPointerUp(e: PointerEventData, { editor }: ToolContext): void {
    if (this.draftNodeId) {
      if (!this.hasDragged) {
        // Remove draft if user didn't drag (just clicked)
        editor.document.removeNode(this.draftNodeId)
        editor.selection.clear()
        editor.renderer?.renderShapes()
        this.draftNodeId = undefined
        this.hasDragged = false
        return
      }
      // Complete the shape and switch to select tool
      this.draftNodeId = undefined
      this.hasDragged = false
      editor.setActiveTool(TOOL_IDS.SELECT)
    }
  }

  /**
   * Reset tool state
   */
  protected resetState(): void {
    this.draftNodeId = undefined
    this.hasDragged = false
  }
}

// Made with Bob
