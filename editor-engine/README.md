# Editor Engine – Core

**Built a framework-agnostic graphics editor engine in pure TypeScript using Clean Architecture and Ports-and-Adapters. The core is independent of UI frameworks and rendering technologies, enabling the same engine to support multiple frontend integrations and rendering backends without changes to business logic.**

## Core Responsibilities

- **Document and shape data** - Hierarchical document model with shape primitives
- **Editor state management** - Centralized state with immutable updates
- **Tools and their lifecycle** - Pluggable tool system (Select, Rectangle, Ellipse, Line)
- **Selection and commands** - Command pattern for undo/redo
- **Use-case services** - Hit testing, bounding boxes, transforms, grouping algorithms
- **Ports (interfaces)** - Clean interfaces for framework-independent integration

## Architecture

The core **never depends on Canvas, DOM, React, or browser APIs**.

- **Pure TypeScript** with zero UI framework dependencies
- **Ports & Adapters** pattern for rendering and input
- **Command pattern** for state management
- **State machines** for tool interactions
- Fully unit-testable

---
