import { Shape } from "./model/Shape";

export class Document {
  private readonly shapes = new Map<string, Shape>();

  // ---------------------------------------------
  // Queries
  // ---------------------------------------------

  getAll(): readonly Shape[] {
    return Array.from(this.shapes.values());
  }

  getById(id: string): Shape | undefined {
    return this.shapes.get(id);
  }

  has(id: string): boolean {
    return this.shapes.has(id);
  }

  // ---------------------------------------------
  // Commands
  // ---------------------------------------------

  add(shape: Shape): void {
    if (this.shapes.has(shape.id)) {
      throw new Error(`Shape with id '${shape.id}' already exists`);
    }

    this.shapes.set(shape.id, shape);
  }

  remove(id: string): void {
    this.shapes.delete(id);
  }

  update(shape: Shape): void {
    if (!this.shapes.has(shape.id)) {
      throw new Error(`Shape with id '${shape.id}' does not exist`);
    }

    this.shapes.set(shape.id, shape);
  }

  clear(): void {
    this.shapes.clear();
  }
}
