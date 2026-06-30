# Canvas Drawing Tool

A browser-based drawing tool built on a framework-agnostic engine.

## Editor engine

Framework-agnostic editor engine.

A pure TypeScript engine with a retained-mode scene graph of shapes, transformed via the Command pattern and rendered through pluggable adapters — completely independent of the HTML5 Canvas API or any UI framework.

- Ports & Adapters
- Command Pattern
- State Machines
- Event-Driven

Open [`editor-engine/README.md`](editor-engine/README.md) for the engine details.

## App types

### Vanilla JavaScript

Raw engine integration with no framework. Direct HTML5 Canvas adapter, no build step, no dependencies.

Open [`public/vanilla-app/README.md`](public/vanilla-app/README.md) for the vanilla app.

### Next.js

Production-grade React app on the same engine. Real-time collaboration via Socket.IO, auth, and persistent storage.

Open [`app/README.md`](app/README.md) for the full-stack app.

## Packages

- [`editor-engine/`](editor-engine/) - Core TypeScript editor engine
- [`public/vanilla-app/`](public/vanilla-app/) - Vanilla JavaScript example
- [`app/`](app/) - Next.js frontend
- [`server/`](server/) - Express backend
