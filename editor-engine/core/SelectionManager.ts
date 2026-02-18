export class SelectionManager {
  private readonly selectedIds = new Set<string>();

  // ---------------------------------------------
  // Queries
  // ---------------------------------------------

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  getAll(): readonly string[] {
    return Array.from(this.selectedIds);
  }

  isEmpty(): boolean {
    return this.selectedIds.size === 0;
  }

  // ---------------------------------------------
  // Commands
  // ---------------------------------------------

  clear(): void {
    this.selectedIds.clear();
  }

  select(id: string): void {
    this.selectedIds.add(id);
  }

  deselect(id: string): void {
    this.selectedIds.delete(id);
  }

  setSingle(id: string): void {
    this.selectedIds.clear();
    this.selectedIds.add(id);
  }

  toggle(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  setMany(ids: Iterable<string>): void {
    this.selectedIds.clear();
    for (const id of ids) {
      this.selectedIds.add(id);
    }
  }
}
