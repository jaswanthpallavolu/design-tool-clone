import { ShapeHitTestPort, HandleHitTestPort } from "./HitTestPort"

export interface RenderPort {
  renderShapes(): void
  clear(): void

  renderSelectionBox(): void
  clearSelectionBox(): void
  renderSelectionBounds(): void
  renderSelectionHandles(): void

  renderHoverOutline(): void

  getShapeHitTestAdapter(): ShapeHitTestPort
  getHandleHitTestAdapter(): HandleHitTestPort
}
