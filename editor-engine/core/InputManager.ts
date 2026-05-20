import type { Editor } from "./Editor"
import type { PointerEventData } from "./types/InputTypes"
import { KeyboardShortcutManager } from "./KeyboardShortcutManager"
import { GroupCommand, UngroupCommand } from "./commands"

/**
 * InputManager - Handles all input events (pointer and keyboard)
 * Delegates to appropriate handlers and manages shortcuts
 */
export class InputManager {
  private shortcuts: KeyboardShortcutManager

  constructor(private editor: Editor) {
    this.shortcuts = new KeyboardShortcutManager()
  }

  /**
   * Get the keyboard shortcut manager
   */
  getShortcutManager(): KeyboardShortcutManager {
    return this.shortcuts
  }

  /**
   * Handle pointer down events
   */
  handlePointerDown(e: PointerEventData): void {
    this.editor.tools.pointerDown(e)
  }

  /**
   * Handle pointer move events
   */
  handlePointerMove(e: PointerEventData): void {
    this.editor.tools.pointerMove(e)
  }

  /**
   * Handle pointer up events
   */
  handlePointerUp(e: PointerEventData): void {
    this.editor.tools.pointerUp(e)
  }

  /**
   * Handle keyboard down events
   */
  handleKeyDown(e: KeyboardEvent): void {
    // Handle undo shortcut (Cmd/Ctrl+Z without Shift)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "z" &&
      !e.shiftKey
    ) {
      e.preventDefault()
      this.editor.undo()
      return
    }

    // Handle redo shortcut (Cmd/Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && e.shiftKey) {
      e.preventDefault()
      this.editor.redo()
      return
    }

    // Handle grouping shortcuts
    if (this.shortcuts.isGroupShortcut(e)) {
      e.preventDefault()
      this.editor.commands.execute(new GroupCommand(this.editor))
      return
    }

    if (this.shortcuts.isUngroupShortcut(e)) {
      e.preventDefault()
      this.editor.commands.execute(new UngroupCommand(this.editor))
      return
    }

    // Handle tool selection shortcuts
    const toolId = this.shortcuts.getToolForKey(e)
    if (toolId && this.editor.tools.getActive()?.id !== toolId) {
      e.preventDefault()
      this.editor.setActiveTool(toolId)
      this.editor.selection.clear()
      this.editor.state.clearTransient()
      this.editor.renderer?.clearSelectionBox()
      // [TODO] - Add hover tracking at the Editor level so it persists across tool switches
      return
    }

    // Pass to active tool
    this.editor.tools.keyDown(e)
  }

  /**
   * Handle keyboard up events
   */
  handleKeyUp(e: KeyboardEvent): void {
    this.editor.tools.keyUp(e)
  }
}

// Made with Bob
