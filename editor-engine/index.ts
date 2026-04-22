// editor-engine/index.ts
// Barrel export file for the editor-engine

// Core
export { Editor } from "./core/Editor"
export { Document } from "./core/Document"
export { EditorState, type ToolOptions } from "./core/EditorState"
export { SelectionManager } from "./core/SelectionManager"
export { ToolManager } from "./core/ToolManager"

// Models
export { type Shape, ShapeType } from "./core/model/Shape"

// Types
export { type PointerEventData } from "./core/types/InputTypes"

// Tools
export { type Tool, type ToolContext } from "./core/tools/Tool"
export { SelectTool } from "./core/tools/select/SelectTool"
export { LineTool } from "./core/tools/LineTool"
export { RectangleTool } from "./core/tools/RectangleTool"
export { EllipseTool } from "./core/tools/EllipseTool"

// Ports
export { type RenderPort } from "./core/ports/RenderPort"

// Adapters
export { CanvasRenderer } from "./adapters/CanvasRenderer"

// Made with Bob
