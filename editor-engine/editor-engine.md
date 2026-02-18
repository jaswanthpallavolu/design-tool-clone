# Editor Engine – Core

This folder contains the **framework-independent, platform-agnostic engine** of the editor.

The core is responsible for:

- document and shape data
- editor state
- tools and their lifecycle
- selection and commands
- use-case services (hit test, bounding boxes, transforms, etc.)
- defining ports (interfaces) to communicate with the outside world

The core **never depends on Canvas, DOM, React, or browser APIs**.

---
