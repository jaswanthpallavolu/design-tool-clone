// core/EditorState.ts

import { Rect } from "./model/Rect"

export interface ToolOptions {
  strokeColor: string
  fillColor: string
}

export class EditorState {
  marquee?: Rect
  hoveredShapeId?: string

  toolOptions: ToolOptions = {
    strokeColor: "#ff9f22",
    fillColor: "#ff9f22",
  }

  clearTransient() {
    this.marquee = undefined
    this.hoveredShapeId = undefined
  }

  updateToolOptions(options: Partial<ToolOptions>) {
    Object.entries(options).forEach(([key, value]) => {
      if (key in this.toolOptions) {
        this.toolOptions[key as keyof ToolOptions] =
          value as ToolOptions[keyof ToolOptions]
      }
    })
  }

  getToolOption(key: keyof ToolOptions) {
    return this.toolOptions?.[key]
  }
}
