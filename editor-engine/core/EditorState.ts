import { EditorConfig } from "../config/EditorConfig"
import { AABB } from "./services/BoundingBoxService"

export interface ToolOptions {
  strokeColor: string
  fillColor: string
}

export class EditorState {
  marquee?: AABB // used by renderer
  hoveredNodeId?: string
  selectionBounds?: AABB

  toolOptions: ToolOptions = {
    strokeColor: EditorConfig.defaultToolOptions.strokeColor,
    fillColor: EditorConfig.defaultToolOptions.fillColor,
  }

  clearTransient() {
    this.marquee = undefined
    this.hoveredNodeId = undefined
    this.selectionBounds = undefined
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
