import { HitTestPort } from "./HitTestPort"

export interface RenderPort {
  renderShapes(): void

  renderSelectionBox(): void
  clearSelectionBox(): void
  renderSelectionBounds(): void

  renderHoverOutline(): void

  getHitTestAdapter(): HitTestPort | null
}
