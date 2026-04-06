import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState, ToolOptions } from "./EditorState"
import { Tool } from "./tools/Tool"
import { RenderPort } from "./ports/RenderPort"
import type { PointerEventData } from "./types/InputTypes"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
  renderer?: RenderPort
  onToolChanged?: (toolId: string) => void

  addTools(tools: Tool[]) {
    this.tools.addTools(tools)
  }

  setActiveTool(tool: string) {
    this.tools.setActive(tool)
    this.onToolChanged?.(tool)
  }

  updateToolOptions(options: Partial<ToolOptions>) {
    this.state.updateToolOptions(options)
  }

  getToolOption(key: keyof ToolOptions) {
    return this.state.getToolOption(key)
  }

  onPointerDown(e: PointerEventData) {
    this.tools.pointerDown(e)
  }

  onPointerMove(e: PointerEventData) {
    this.tools.pointerMove(e)
  }

  onPointerUp(e: PointerEventData) {
    this.tools.pointerUp(e)
  }

  onKeyDown(e: KeyboardEvent) {
    // Handle global tool shortcuts (when no modifier keys are pressed)
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const handled = this.handleToolSelection(e)
      if (handled) {
        e.preventDefault()
        this.selection.clear()
        this.state.clearTransient()
        this.renderer?.clearSelectionBox()
        // [TODO] - Add hover tracking at the Editor level so it persists across tool switches
        return
      }
    }

    // Pass to active tool
    this.tools.keyDown(e)
  }

  private handleToolSelection(e: KeyboardEvent): boolean {
    const key = e.key.toLowerCase()

    // Map keys to tool IDs
    const toolMap: Record<string, string> = {
      v: "select",
      r: "rectangle",
      o: "ellipse",
      l: "line",
    }

    const toolId = toolMap[key]
    if (toolId && this.tools.getActive()?.id !== toolId) {
      this.setActiveTool(toolId)
      return true
    }

    return false
  }

  onKeyUp(e: KeyboardEvent) {
    this.tools.keyUp(e)
  }

  setRenderer(renderer: RenderPort) {
    this.renderer = renderer
  }
}
