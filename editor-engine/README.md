# Editor Engine – Core

**Built a framework-agnostic graphics editor engine in pure TypeScript using Clean Architecture and Ports-and-Adapters. The core is independent of UI frameworks and rendering technologies, enabling the same engine to support multiple frontend integrations and rendering backends without changes to business logic.**

---

## Core Responsibilities

### Document & Shape Data

Hierarchical document model with shape primitives

### Editor State Management

Centralized state with immutable updates

### Tools & Lifecycle

Pluggable tool system (Select, Rectangle, Ellipse, Line)

### Selection & Commands

Command pattern for undo/redo

### Use-case Services

Hit testing, bounding boxes, transforms, grouping algorithms

### Ports (Interfaces)

Clean interfaces for framework-independent integration

---

## Architecture

> **The core never depends on Canvas, DOM, React, or browser APIs.**

- **Pure TypeScript** with zero UI framework dependencies
- **Ports & Adapters** pattern for rendering and input
- **Command pattern** for state management
- **State machines** for tool interactions
- Fully unit-testable

---

## Project Structure

### Core

Contains the main editor logic: `Editor`, `Document`, `EditorState`, `SelectionManager`, `ToolManager`, `EventBus`

### Commands

Implements the command pattern for all editor operations: `SetToolCommand`, `UpdateToolOptionsCommand`, `UpdateShapesStyleCommand`, `ClearCommand`, and more

### Services

Business logic services: `GroupService`, `BoundingBoxService`, `SpatialIndexService`, `ShapeQueryService`

### Tools

Tool implementations: `SelectTool`, `RectangleTool`, `EllipseTool`, `LineTool`

### Ports

Interfaces for external dependencies: `RenderPort`, `HitTestPort`

### Adapters

Concrete implementations: `CanvasRenderer`, `CanvasHitTestAdapter`

---
