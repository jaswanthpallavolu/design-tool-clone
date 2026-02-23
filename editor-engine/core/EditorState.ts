// core/EditorState.ts

import { Rect } from "./model/Rect"
import { EditorConfig } from "../config/EditorConfig"

export interface ToolOptions {
  strokeColor: string
  fillColor: string
}

export class EditorState {
  marquee?: Rect
  hoveredShapeId?: string

  toolOptions: ToolOptions = {
    strokeColor: EditorConfig.defaultToolOptions.strokeColor,
    fillColor: EditorConfig.defaultToolOptions.fillColor,
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
