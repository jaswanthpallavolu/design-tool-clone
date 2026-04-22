import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState, ToolOptions } from "./EditorState"
import { Tool } from "./tools/Tool"
import { RenderPort } from "./ports/RenderPort"
import type { PointerEventData } from "./types/InputTypes"
import { GroupService } from "./services/GroupService"
import { BoundingBoxService } from "./services/BoundingBoxService"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
  readonly groupService = new GroupService(this.document)
  renderer?: RenderPort
  onToolChanged?: (toolId: string) => void

  addTools(tools: Tool[]) {
    this.tools.addTools(tools)
  }

  setActiveTool(tool: string) {
    this.tools.setActive(tool)
    this.onToolChanged?.(tool)
  }

  updateToolOptions(options: Partial<ToolOptions>) {
    this.state.updateToolOptions(options)
  }

  getToolOption(key: keyof ToolOptions) {
    return this.state.getToolOption(key)
  }

  onPointerDown(e: PointerEventData) {
    this.tools.pointerDown(e)
  }

  onPointerMove(e: PointerEventData) {
    this.tools.pointerMove(e)
  }

  onPointerUp(e: PointerEventData) {
    this.tools.pointerUp(e)

    // Debug: Print document tree after every interaction
    if (this.document.getAllNodes().length > 0) {
      this.document.debugTree()
    }
  }

  onKeyDown(e: KeyboardEvent) {
    // Handle grouping shortcuts (Cmd/Ctrl+G and Cmd/Ctrl+Shift+G)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
      e.preventDefault()
      if (e.shiftKey) {
        this.ungroupSelection()
      } else {
        this.groupSelection()
      }
      return
    }

    // Handle global tool shortcuts (when no modifier keys are pressed)
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const handled = this.handleToolSelection(e)
      if (handled) {
        e.preventDefault()
        this.selection.clear()
        this.state.clearTransient()
        this.renderer?.clearSelectionBox()
        // [TODO] - Add hover tracking at the Editor level so it persists across tool switches
        return
      }
    }

    // Pass to active tool
    this.tools.keyDown(e)
  }

  private handleToolSelection(e: KeyboardEvent): boolean {
    const key = e.key.toLowerCase()

    // Map keys to tool IDs
    const toolMap: Record<string, string> = {
      v: "select",
      r: "rectangle",
      o: "ellipse",
      l: "line",
    }

    const toolId = toolMap[key]
    if (toolId && this.tools.getActive()?.id !== toolId) {
      this.setActiveTool(toolId)
      return true
    }

    return false
  }

  onKeyUp(e: KeyboardEvent) {
    this.tools.keyUp(e)
  }

  setRenderer(renderer: RenderPort) {
    this.renderer = renderer
  }

  clear() {
    this.document.clear()
    this.selection.clear()
    this.state.clearTransient()
    this.renderer?.clear()
  }

  // ---------------------------------------------
  // Grouping Operations
  // ---------------------------------------------

  /**
   * Group the currently selected nodes
   * Returns the ID of the newly created group, or null if grouping failed
   */
  groupSelection(): string | null {
    const selectedIds = [...this.selection.getAll()]

    if (!this.groupService.canGroup(selectedIds)) {
      return null
    }

    const groupId = this.groupService.groupNodes(selectedIds)

    if (groupId) {
      // Select the newly created group
      this.selection.setSingle(groupId)
    }

    return groupId
  }

  /**
   * Ungroup the currently selected group nodes
   * Returns the IDs of the ungrouped children, or null if ungrouping failed
   */
  ungroupSelection(): string[] | null {
    const selectedIds = this.selection.getAll()

    // Handle single group selection
    if (selectedIds.length === 1) {
      const groupId = selectedIds[0]

      if (!this.groupService.canUngroup(groupId)) {
        return null
      }

      const childIds = this.groupService.ungroupNode(groupId)

      if (childIds) {
        // Select the ungrouped children
        this.selection.setMany(childIds)
      }

      return childIds
    }

    // Handle multiple selections - ungroup all groups
    const allUngroupedIds: string[] = []
    for (const id of selectedIds) {
      if (this.groupService.canUngroup(id)) {
        const childIds = this.groupService.ungroupNode(id)
        if (childIds) {
          allUngroupedIds.push(...childIds)
        }
      }
    }

    if (allUngroupedIds.length > 0) {
      this.selection.setMany(allUngroupedIds)
      return allUngroupedIds
    }

    return null
  }
}
