# Canvas Tool

A **framework-agnostic graphics editor engine** demonstrating Clean Architecture principles through multiple UI implementations.

## Core Innovation: Editor Engine

The [`editor-engine/`](editor-engine/) is a pure TypeScript graphics editor built with zero UI framework dependencies:

- **Clean Architecture** - Business logic independent of frameworks
- **Ports & Adapters** - Pluggable rendering and input systems
- **Command Pattern** - Full undo/redo support
- **Event-Driven** - Decoupled component communication

**Key Capabilities:**

- Shape primitives (Rectangle, Ellipse, Line)
- Selection, transformation, grouping
- Tool system with state machines
- Hierarchical document model

[→ See detailed engine documentation](editor-engine/README.md)

## Architecture: One Engine, Multiple UIs

This project demonstrates the engine's reusability through two different implementations. The framework-agnostic editor engine serves as the core foundation, with adapters connecting it to different UI frameworks and rendering contexts. This architecture proves that business logic can remain completely independent of presentation layers.

**Implementation Strategy:**

- The editor engine exposes a clean API through ports (interfaces)
- Each implementation provides adapters for rendering and input handling
- State management and business rules remain centralized in the engine
- UI frameworks only handle presentation and user interaction

### 1. Vanilla JavaScript Implementation

**Location:** [`public/vanilla-app/`](public/vanilla-app/)

Pure JavaScript integration showing the engine's portability without any framework dependencies.

[→ See vanilla app documentation](public/vanilla-app/README.md)

### 2. Full-Stack Next.js Application

**Location:** [`app/design/`](app/design/) + [`server/`](server/)

Production-ready React application with real-time collaboration, authentication, and persistent storage.

[→ See full-stack app documentation](app/README.md)

## Tech Stack

**Core Engine:** TypeScript, Pure functional architecture

**Vanilla App:** HTML5 Canvas, Vanilla JavaScript

**Full-Stack App:** Next.js 16, React 19, Socket.IO, PostgreSQL, Prisma
