import { Command } from "./Command"
import { EventBus } from "../EventBus"

/**
 * CommandManager - Manages command execution and history for undo/redo
 */
export class CommandManager {
  private history: Command[] = []
  private currentIndex = -1
  private maxHistorySize = 100

  constructor(private eventBus: EventBus) {}

  /**
   * Execute a command and add it to history
   * @param command - Command to execute
   */
  execute(command: Command): void {
    if (!command.canExecute()) {
      console.warn("Command cannot be executed:", command.describe())
      return
    }

    try {
      // Execute the command
      command.execute()

      // Only add to history if the command is undoable
      if (command.isUndoable()) {
        // Clear any redo history
        this.history = this.history.slice(0, this.currentIndex + 1)

        // Add to history
        this.history.push(command)
        this.currentIndex++

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
          this.history.shift()
          this.currentIndex--
        }
      }

      // Emit event
      this.eventBus.emit("command:executed", {
        command: command.describe(),
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      })
    } catch (error) {
      console.error("Error executing command:", command.describe(), error)
      this.eventBus.emit("command:error", {
        command: command.describe(),
        error,
      })
    }
  }

  /**
   * Undo the last command
   * @returns true if undo was successful
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false
    }

    try {
      const command = this.history[this.currentIndex]

      if (!command.canUndo()) {
        console.warn("Command cannot be undone:", command.describe())
        return false
      }

      command.undo()
      this.currentIndex--

      this.eventBus.emit("command:undone", {
        command: command.describe(),
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      })

      return true
    } catch (error) {
      console.error("Error undoing command:", error)
      this.eventBus.emit("command:error", { error })
      return false
    }
  }

  /**
   * Redo the next command
   * @returns true if redo was successful
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false
    }

    try {
      this.currentIndex++
      const command = this.history[this.currentIndex]

      command.execute()

      this.eventBus.emit("command:redone", {
        command: command.describe(),
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      })

      return true
    } catch (error) {
      console.error("Error redoing command:", error)
      this.currentIndex--
      this.eventBus.emit("command:error", { error })
      return false
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Clear command history
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.eventBus.emit("command:history:cleared")
  }

  /**
   * Get command history for debugging
   */
  getHistory(): string[] {
    return this.history.map((cmd) => cmd.describe())
  }

  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size)
  }
}

// Made with Bob
