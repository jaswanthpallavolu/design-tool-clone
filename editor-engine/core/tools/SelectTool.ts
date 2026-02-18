import { Tool, ToolContext } from "./Tool"

export class SelectTool implements Tool {
  readonly id = "select"

  onPointerDown(e: PointerEvent, { editor }: ToolContext) {
    // TODO: Implement hit testing to pick shapes at pointer position
    // For now, just clear selection when clicking
    editor.selection.clear()
  }
}
