// editor-engine/index.ts
// Barrel export file for the editor-engine

// Core
export { Editor } from "./core/Editor"
export { Document } from "./core/Document"
export { EditorState, type ToolOptions } from "./core/EditorState"
export { SelectionManager } from "./core/SelectionManager"
export { ToolManager } from "./core/ToolManager"

// Models
export { type Shape } from "./core/model/Shape"

// Tools
export { type Tool, type ToolContext } from "./core/tools/Tool"
export { SelectTool } from "./core/tools/SelectTool"

// Ports
export { type RenderPort } from "./core/ports/RenderPort"

// Adapters
export { CanvasRenderer } from "./adapters/CanvasRenderer"
export { ToolbarAdapter } from "./adapters/ToolbarAdapter"

// Made with Bob
