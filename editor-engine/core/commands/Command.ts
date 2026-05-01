/**
 * Command - Base class for all editor commands
 * Implements the Command Pattern for undo/redo functionality
 */
export abstract class Command {
  /**
   * Execute the command
   */
  abstract execute(): void

  /**
   * Undo the command (reverse the execute operation)
   */
  abstract undo(): void

  /**
   * Get a human-readable description of the command
   */
  abstract describe(): string

  /**
   * Optional: Check if the command can be executed
   * @returns true if command can be executed
   */
  canExecute(): boolean {
    return true
  }

  /**
   * Optional: Check if the command can be undone
   * @returns true if command can be undone
   */
  canUndo(): boolean {
    return true
  }

  /**
   * Optional: Check if the command should be added to undo/redo history
   * @returns true if command should be stored in history (default: true)
   */
  isUndoable(): boolean {
    return true
  }
}

// Made with Bob
