/**
 * EventBus - Central event management system for the editor
 * Enables decoupled communication between components
 */

type EventCallback = (data?: unknown) => void

export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>()

  /**
   * Subscribe to an event
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  /**
   * Subscribe to an event that fires only once
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   */
  once(event: string, callback: EventCallback): void {
    const unsubscribe = this.on(event, (data?: unknown) => {
      unsubscribe()
      callback(data)
    })
  }

  /**
   * Emit an event to all subscribers
   * @param event - Event name to emit
   * @param data - Data to pass to subscribers
   */
  emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      })
    }

    // Also emit to wildcard listeners
    const wildcardCallbacks = this.listeners.get("*")
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback({ event, data })
        } catch (error) {
          console.error(`Error in wildcard event listener:`, error)
        }
      })
    }
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Callback to remove
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   * @param event - Optional event name to clear
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get count of listeners for an event
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0
  }
}

// Made with Bob
