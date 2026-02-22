import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState, ToolOptions } from "./EditorState"
import { Tool } from "./tools/Tool"
import { RenderPort } from "./ports/RenderPort"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
  private renderer?: RenderPort

  addTools(tools: Tool[]) {
    this.tools.addTools(tools)
  }

  setActiveTool(tool: string) {
    this.tools.setActive(tool)
  }

  updateToolOptions(options: Partial<ToolOptions>) {
    this.state.updateToolOptions(options)
  }

  getToolOption(key: keyof ToolOptions) {
    return this.state.getToolOption(key)
  }

  onPointerDown(e: PointerEvent) {
    this.tools.pointerDown(e)
  }

  onPointerMove(e: PointerEvent) {
    this.tools.pointerMove(e)
  }

  onPointerUp(e: PointerEvent) {
    this.tools.pointerUp(e)
  }

  setRenderer(renderer: RenderPort) {
    this.renderer = renderer
  }

  renderShapes() {
    this.renderer?.renderShapes()
  }
}
