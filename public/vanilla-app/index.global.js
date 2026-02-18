"use strict";
var EditorEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // editor-engine/index.ts
  var index_exports = {};
  __export(index_exports, {
    CanvasRenderer: () => CanvasRenderer,
    Document: () => Document,
    Editor: () => Editor,
    EditorState: () => EditorState,
    SelectTool: () => SelectTool,
    SelectionManager: () => SelectionManager,
    ToolManager: () => ToolManager,
    ToolbarAdapter: () => ToolbarAdapter
  });

  // editor-engine/core/Document.ts
  var Document = class {
    constructor() {
      this.shapes = /* @__PURE__ */ new Map();
    }
    // ---------------------------------------------
    // Queries
    // ---------------------------------------------
    getAll() {
      return Array.from(this.shapes.values());
    }
    getById(id) {
      return this.shapes.get(id);
    }
    has(id) {
      return this.shapes.has(id);
    }
    // ---------------------------------------------
    // Commands
    // ---------------------------------------------
    add(shape) {
      if (this.shapes.has(shape.id)) {
        throw new Error(`Shape with id '${shape.id}' already exists`);
      }
      this.shapes.set(shape.id, shape);
    }
    remove(id) {
      this.shapes.delete(id);
    }
    update(shape) {
      if (!this.shapes.has(shape.id)) {
        throw new Error(`Shape with id '${shape.id}' does not exist`);
      }
      this.shapes.set(shape.id, shape);
    }
    clear() {
      this.shapes.clear();
    }
  };

  // editor-engine/core/SelectionManager.ts
  var SelectionManager = class {
    constructor() {
      this.selectedIds = /* @__PURE__ */ new Set();
    }
    // ---------------------------------------------
    // Queries
    // ---------------------------------------------
    isSelected(id) {
      return this.selectedIds.has(id);
    }
    getAll() {
      return Array.from(this.selectedIds);
    }
    isEmpty() {
      return this.selectedIds.size === 0;
    }
    // ---------------------------------------------
    // Commands
    // ---------------------------------------------
    clear() {
      this.selectedIds.clear();
    }
    select(id) {
      this.selectedIds.add(id);
    }
    deselect(id) {
      this.selectedIds.delete(id);
    }
    setSingle(id) {
      this.selectedIds.clear();
      this.selectedIds.add(id);
    }
    toggle(id) {
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    }
    setMany(ids) {
      this.selectedIds.clear();
      for (const id of ids) {
        this.selectedIds.add(id);
      }
    }
  };

  // editor-engine/core/ToolManager.ts
  var ToolManager = class {
    constructor(editor) {
      this.tools = /* @__PURE__ */ new Map();
      this.ctx = { editor };
    }
    // ---------------------------------------------
    // Registration
    // ---------------------------------------------
    register(tool) {
      if (this.tools.has(tool.id)) {
        throw new Error(`Tool '${tool.id}' is already registered`);
      }
      this.tools.set(tool.id, tool);
    }
    // ---------------------------------------------
    // Tool state
    // ---------------------------------------------
    getActive() {
      return this.activeTool;
    }
    setActive(id) {
      var _a, _b, _c, _d;
      const next = this.tools.get(id);
      if (!next) {
        throw new Error(`Tool '${id}' is not registered`);
      }
      if (this.activeTool === next) return;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onDeactivate) == null ? void 0 : _b.call(_a, this.ctx);
      this.activeTool = next;
      (_d = (_c = this.activeTool).onActivate) == null ? void 0 : _d.call(_c, this.ctx);
    }
    // ---------------------------------------------
    // Input routing
    // ---------------------------------------------
    pointerDown(e) {
      var _a, _b;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onPointerDown) == null ? void 0 : _b.call(_a, e, this.ctx);
    }
    pointerMove(e) {
      var _a, _b;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onPointerMove) == null ? void 0 : _b.call(_a, e, this.ctx);
    }
    pointerUp(e) {
      var _a, _b;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onPointerUp) == null ? void 0 : _b.call(_a, e, this.ctx);
    }
    keyDown(e) {
      var _a, _b;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onKeyDown) == null ? void 0 : _b.call(_a, e, this.ctx);
    }
    keyUp(e) {
      var _a, _b;
      (_b = (_a = this.activeTool) == null ? void 0 : _a.onKeyUp) == null ? void 0 : _b.call(_a, e, this.ctx);
    }
  };

  // editor-engine/core/EditorState.ts
  var EditorState = class {
    constructor() {
      this.toolOptions = { strokeColor: "#000000", fillColor: "#ffffff" };
    }
    clearTransient() {
      this.marquee = void 0;
      this.hoveredShapeId = void 0;
    }
  };

  // editor-engine/core/Editor.ts
  var Editor = class {
    constructor() {
      this.document = new Document();
      this.selection = new SelectionManager();
      this.tools = new ToolManager(this);
      this.state = new EditorState();
    }
  };

  // editor-engine/core/tools/SelectTool.ts
  var SelectTool = class {
    constructor() {
      this.id = "select";
    }
    onPointerDown(e, { editor }) {
      editor.selection.clear();
    }
  };

  // editor-engine/adapters/CanvasRenderer.ts
  var CanvasRenderer = class {
    renderShapes() {
    }
    renderSelectionBox(box) {
    }
    clearSelectionBox() {
    }
  };

  // editor-engine/adapters/ToolbarAdapter.ts
  var ToolbarAdapter = class {
    constructor(editor) {
      this.editor = editor;
      this.registerTools();
    }
    /**
     * Register all available tools with the editor
     * This is where tools are added to the ToolManager
     */
    registerTools() {
      this.editor.tools.register(new SelectTool());
    }
    /**
     * Activate a tool by its ID
     * This would typically be called when a user clicks a toolbar button
     */
    activateTool(toolId) {
      this.editor.tools.setActive(toolId);
    }
    /**
     * Get the currently active tool ID
     */
    getActiveTool() {
      var _a;
      return (_a = this.editor.tools.getActive()) == null ? void 0 : _a.id;
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map