// core/ToolManager.ts

import type { Editor } from "./Editor"
import { Tool, ToolContext } from "./tools/Tool"

export class ToolManager {
  private readonly tools = new Map<string, Tool>()
  private activeTool?: Tool

  private readonly ctx: ToolContext

  constructor(editor: Editor) {
    this.ctx = { editor }
  }

  // ---------------------------------------------
  // Registration
  // ---------------------------------------------

  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool '${tool.id}' is already registered`)
    }

    this.tools.set(tool.id, tool)
  }

  // ---------------------------------------------
  // Tool state
  // ---------------------------------------------

  getActive(): Tool | undefined {
    return this.activeTool
  }

  setActive(id: string): void {
    const next = this.tools.get(id)

    if (!next) {
      throw new Error(`Tool '${id}' is not registered`)
    }

    if (this.activeTool === next) return

    this.activeTool?.onDeactivate?.(this.ctx)

    this.activeTool = next

    this.activeTool.onActivate?.(this.ctx)
  }

  // ---------------------------------------------
  // Input routing
  // ---------------------------------------------

  pointerDown(e: PointerEvent): void {
    this.activeTool?.onPointerDown?.(e, this.ctx)
  }

  pointerMove(e: PointerEvent): void {
    this.activeTool?.onPointerMove?.(e, this.ctx)
  }

  pointerUp(e: PointerEvent): void {
    this.activeTool?.onPointerUp?.(e, this.ctx)
  }

  keyDown(e: KeyboardEvent): void {
    this.activeTool?.onKeyDown?.(e, this.ctx)
  }

  keyUp(e: KeyboardEvent): void {
    this.activeTool?.onKeyUp?.(e, this.ctx)
  }
}
