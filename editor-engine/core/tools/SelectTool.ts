import { Tool, ToolContext } from "./Tool"

export class SelectTool implements Tool {
  readonly id = "select"

  onPointerDown(e: PointerEvent, { editor }: ToolContext): void {
    if (!editor.state.hoveredShapeId) {
      editor.selection.clear()
    }
  }

  onPointerMove(e: PointerEvent, { editor }: ToolContext): void {
    if (editor.state.hoveredShapeId) {
      const hoveredShape = editor.document.getById(editor.state.hoveredShapeId)
      if (
        hoveredShape &&
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(hoveredShape, e.clientX, e.clientY)
      ) {
        return
      }
    }
    editor.state.hoveredShapeId = editor.document
      .getAll()
      .find((shape) =>
        editor.renderer
          ?.getHitTestAdapter()
          ?.testShape(shape, e.clientX, e.clientY),
      )?.id
    editor.renderer?.renderHoverOutline()
  }

  onPointerUp(e: PointerEvent, { editor }: ToolContext): void {}
}
