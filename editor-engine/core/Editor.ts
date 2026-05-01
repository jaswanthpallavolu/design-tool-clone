import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState, ToolOptions } from "./EditorState"
import { Tool } from "./tools/Tool"
import { RenderPort } from "./ports/RenderPort"
import type { PointerEventData } from "./types/InputTypes"
import { GroupService } from "./services/GroupService"
import { BoundingBoxService } from "./services/BoundingBoxService"
import { EventBus } from "./EventBus"
import { CommandManager } from "./commands/CommandManager"
import {
  SetToolCommand,
  UpdateToolOptionsCommand,
  ClearCommand,
} from "./commands"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
  readonly groupService = new GroupService(this.document)
  readonly events = new EventBus()
  readonly commands: CommandManager
  renderer?: RenderPort

  constructor() {
    this.commands = new CommandManager(this.events)
  }

  /**
   * Subscribe to editor events
   * @param event - Event name
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  on(event: string, callback: (data?: unknown) => void): () => void {
    return this.events.on(event, callback)
  }

  /**
   * Emit an event (for internal use)
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data?: unknown): void {
    this.events.emit(event, data)
  }

  addTools(tools: Tool[]) {
    this.tools.addTools(tools)
  }

  setActiveTool(tool: string) {
    this.commands.execute(new SetToolCommand(this, tool))
  }

  updateToolOptions(options: Partial<ToolOptions>) {
    this.commands.execute(new UpdateToolOptionsCommand(this, options))
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
    this.emit("document:modified")
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
      this.emit("document:modified")
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
    this.commands.execute(new ClearCommand(this))
  }

  /**
   * Undo the last command
   * @returns true if undo was successful
   */
  undo(): boolean {
    const result = this.commands.undo()
    if (result) {
      this.emit("document:modified")
    }
    return result
  }

  /**
   * Redo the next command
   * @returns true if redo was successful
   */
  redo(): boolean {
    const result = this.commands.redo()
    if (result) {
      this.emit("document:modified")
    }
    return result
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.commands.canUndo()
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.commands.canRedo()
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
