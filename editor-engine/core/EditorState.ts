import { EditorConfig } from "../config/EditorConfig"
import { AABB } from "./services/BoundingBoxService"
import type { EventBus } from "./EventBus"

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

  constructor(private readonly eventBus: EventBus) {}

  setHoveredNodeId(nodeId: string | undefined): void {
    if (this.hoveredNodeId !== nodeId) {
      this.hoveredNodeId = nodeId
      this.eventBus?.emit("hover:changed", nodeId)
    }
  }

  getHoveredNodeId(): string | undefined {
    return this.hoveredNodeId
  }

  clearTransient() {
    this.marquee = undefined
    const hadHover = this.hoveredNodeId !== undefined
    this.hoveredNodeId = undefined
    this.selectionBounds = undefined
    if (hadHover) {
      this.eventBus?.emit("hover:changed", undefined)
    }
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
