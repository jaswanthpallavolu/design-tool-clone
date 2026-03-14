// core/tools/Tool.ts

import type { Editor } from "../Editor"
import type { PointerEventData } from "../types/InputTypes"

export interface ToolContext {
  readonly editor: Editor
  renderOverlays(): void
}

export interface Tool {
  readonly id: string

  onActivate?(ctx: ToolContext): void
  onDeactivate?(ctx: ToolContext): void

  onPointerDown?(e: PointerEventData, ctx: ToolContext): void
  onPointerMove?(e: PointerEventData, ctx: ToolContext): void
  onPointerUp?(e: PointerEventData, ctx: ToolContext): void

  onKeyDown?(e: KeyboardEvent, ctx: ToolContext): void
  onKeyUp?(e: KeyboardEvent, ctx: ToolContext): void
}
