import { RenderPort } from "../core/ports/RenderPort"

export class CanvasRenderer implements RenderPort {
  renderShapes(): void {}

  renderSelectionBox(box: Rect): void {}

  clearSelectionBox(): void {}
}
