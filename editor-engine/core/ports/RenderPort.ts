// core/ports/RenderPort.ts

import { Rect } from "../services/BoundingBoxService"

export interface RenderPort {
  renderShapes(): void

  renderSelectionBox(box: Rect): void

  clearSelectionBox(): void
}
