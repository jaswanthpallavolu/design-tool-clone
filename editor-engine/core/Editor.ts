import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState, ToolOptions } from "./EditorState"
import { Tool } from "./tools/Tool"
import { RenderPort } from "./ports/RenderPort"
import type { PointerEventData } from "./types/InputTypes"
import { GroupService } from "./services/GroupService"
import { EventBus } from "./EventBus"
import { CommandManager } from "./commands/CommandManager"
import {
  SetToolCommand,
  UpdateToolOptionsCommand,
  ClearCommand,
  GroupCommand,
  UngroupCommand,
} from "./commands"
import { InputManager } from "./InputManager"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
  readonly groupService = new GroupService(this.document)
  readonly events = new EventBus()
  readonly commands: CommandManager
  readonly input: InputManager
  renderer?: RenderPort

  constructor() {
    this.commands = new CommandManager(this.events)
    this.input = new InputManager(this)
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
    this.input.handlePointerDown(e)
  }

  onPointerMove(e: PointerEventData) {
    this.input.handlePointerMove(e)
  }

  onPointerUp(e: PointerEventData) {
    this.input.handlePointerUp(e)
  }

  onKeyDown(e: KeyboardEvent) {
    this.input.handleKeyDown(e)
  }

  onKeyUp(e: KeyboardEvent) {
    this.input.handleKeyUp(e)
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
    return this.commands.undo()
  }

  /**
   * Redo the next command
   * @returns true if redo was successful
   */
  redo(): boolean {
    return this.commands.redo()
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
   * Uses GroupCommand for undoable grouping
   */
  groupSelection(): void {
    this.commands.execute(new GroupCommand(this))
  }

  /**
   * Ungroup the currently selected group nodes
   * Uses UngroupCommand for undoable ungrouping
   */
  ungroupSelection(): void {
    this.commands.execute(new UngroupCommand(this))
  }
}
