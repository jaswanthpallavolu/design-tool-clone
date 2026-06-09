import type { EventBus } from "./EventBus"

export class SelectionManager {
  private readonly selectedIds = new Set<string>()

  constructor(private readonly eventBus: EventBus) {}

  private emitChange(): void {
    this.eventBus.emit("selection:changed")
  }

  // ---------------------------------------------
  // Queries
  // ---------------------------------------------

  isSelected(id: string): boolean {
    return this.selectedIds.has(id)
  }

  has(id: string): boolean {
    return this.selectedIds.has(id)
  }

  getAll(): readonly string[] {
    return Array.from(this.selectedIds)
  }

  isEmpty(): boolean {
    return this.selectedIds.size === 0
  }

  // ---------------------------------------------
  // Commands
  // ---------------------------------------------

  clear(): void {
    this.selectedIds.clear()
    this.emitChange()
  }

  select(id: string): void {
    this.selectedIds.add(id)
    this.emitChange()
  }

  deselect(id: string): void {
    this.selectedIds.delete(id)
    this.emitChange()
  }

  setSingle(id: string): void {
    this.selectedIds.clear()
    this.selectedIds.add(id)
    this.emitChange()
  }

  toggle(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id)
    } else {
      this.selectedIds.add(id)
    }
    this.emitChange()
  }

  setMany(ids: Iterable<string>): void {
    this.selectedIds.clear()
    for (const id of ids) {
      this.selectedIds.add(id)
    }
    this.emitChange()
  }
}
