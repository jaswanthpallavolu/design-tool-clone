// core/ports/RenderPort.ts

import { Rect } from "../services/BoundingBoxService"
import { HitTestPort } from "./HitTestPort"

export interface RenderPort {
  renderShapes(): void

  renderSelectionBox(box: Rect): void

  clearSelectionBox(): void

  renderHoverOutline(): void

  getHitTestAdapter(): HitTestPort | null
}
