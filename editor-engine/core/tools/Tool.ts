// core/tools/Tool.ts

import type { Editor } from "../Editor"

export interface ToolContext {
  readonly editor: Editor
}

export interface Tool {
  readonly id: string

  onActivate?(ctx: ToolContext): void
  onDeactivate?(ctx: ToolContext): void

  onPointerDown?(e: PointerEvent, ctx: ToolContext): void
  onPointerMove?(e: PointerEvent, ctx: ToolContext): void
  onPointerUp?(e: PointerEvent, ctx: ToolContext): void

  onKeyDown?(e: KeyboardEvent, ctx: ToolContext): void
  onKeyUp?(e: KeyboardEvent, ctx: ToolContext): void
}
