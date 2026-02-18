// core/EditorState.ts

import { Rect } from "./model/Rect"

export interface ToolOptions {
  strokeColor: string
  fillColor: string
}

export class EditorState {
  marquee?: Rect
  hoveredShapeId?: string

  toolOptions: ToolOptions = { strokeColor: "#000000", fillColor: "#ffffff" }

  clearTransient() {
    this.marquee = undefined
    this.hoveredShapeId = undefined
  }
}
