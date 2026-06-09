/**
 * KeyboardShortcutManager - Handles keyboard shortcuts and tool selection
 */
export class KeyboardShortcutManager {
  private toolMap: Record<string, string> = {
    v: "select",
    r: "rectangle",
    o: "ellipse",
    l: "line",
  }

  /**
   * Check if the event is a grouping shortcut (Cmd/Ctrl+G)
   */
  isGroupShortcut(e: KeyboardEvent): boolean {
    return (
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g" && !e.shiftKey
    )
  }

  /**
   * Check if the event is an ungrouping shortcut (Cmd/Ctrl+Shift+G)
   */
  isUngroupShortcut(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g" && e.shiftKey
  }

  /**
   * Check if the event is a "bring to front" shortcut (Cmd/Ctrl+])
   */
  isBringToFrontShortcut(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key === "]" && !e.shiftKey
  }

  /**
   * Check if the event is a "send to back" shortcut (Cmd/Ctrl+[)
   */
  isSendToBackShortcut(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key === "[" && !e.shiftKey
  }

  /**
   * Check if the event is a "bring forward" shortcut (Alt+])
   */
  isBringForwardShortcut(e: KeyboardEvent): boolean {
    return e.altKey && e.key === "]" && !e.ctrlKey && !e.metaKey && !e.shiftKey
  }

  /**
   * Check if the event is a "send backward" shortcut (Alt+[)
   */
  isSendBackwardShortcut(e: KeyboardEvent): boolean {
    return e.altKey && e.key === "[" && !e.ctrlKey && !e.metaKey && !e.shiftKey
  }

  /**
   * Get the tool ID for a keyboard shortcut
   * Returns null if no tool is mapped to the key
   */
  getToolForKey(e: KeyboardEvent): string | null {
    // Only handle tool shortcuts when no modifier keys are pressed
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return null
    }

    const key = e.key.toLowerCase()
    return this.toolMap[key] || null
  }

  /**
   * Register a custom tool shortcut
   */
  registerToolShortcut(key: string, toolId: string): void {
    this.toolMap[key.toLowerCase()] = toolId
  }

  /**
   * Unregister a tool shortcut
   */
  unregisterToolShortcut(key: string): void {
    delete this.toolMap[key.toLowerCase()]
  }

  /**
   * Get all registered tool shortcuts
   */
  getToolShortcuts(): Record<string, string> {
    return { ...this.toolMap }
  }
}

// Made with Bob
