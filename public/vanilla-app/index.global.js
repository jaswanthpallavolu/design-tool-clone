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
    EllipseTool: () => EllipseTool,
    LineTool: () => LineTool,
    RectangleTool: () => RectangleTool,
    SelectTool: () => SelectTool,
    SelectionManager: () => SelectionManager,
    ToolManager: () => ToolManager
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
    addTools(tools) {
      tools.forEach((tool) => this.register(tool));
    }
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
      this.toolOptions = {
        strokeColor: "#ff9f22",
        fillColor: "#ff9f22"
      };
    }
    clearTransient() {
      this.marquee = void 0;
      this.hoveredShapeId = void 0;
    }
    updateToolOptions(options) {
      Object.entries(options).forEach(([key, value]) => {
        if (key in this.toolOptions) {
          this.toolOptions[key] = value;
        }
      });
    }
    getToolOption(key) {
      var _a;
      return (_a = this.toolOptions) == null ? void 0 : _a[key];
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
    addTools(tools) {
      this.tools.addTools(tools);
    }
    setActiveTool(tool) {
      this.tools.setActive(tool);
    }
    updateToolOptions(options) {
      this.state.updateToolOptions(options);
    }
    getToolOption(key) {
      return this.state.getToolOption(key);
    }
    onPointerDown(e) {
      this.tools.pointerDown(e);
    }
    onPointerMove(e) {
      this.tools.pointerMove(e);
    }
    onPointerUp(e) {
      this.tools.pointerUp(e);
    }
    setRenderer(renderer) {
      this.renderer = renderer;
    }
    renderShapes() {
      var _a;
      (_a = this.renderer) == null ? void 0 : _a.renderShapes();
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

  // editor-engine/core/tools/LineTool.ts
  var LineTool = class {
    constructor() {
      this.id = "line";
    }
    onPointerDown(e, { editor }) {
      this.draft = {
        id: crypto.randomUUID(),
        kind: this.id,
        p1: { x: e.clientX, y: e.clientY },
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor,
        lineWidth: 4
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      if (!this.draft) return;
      this.draft.p2 = { x: e.clientX, y: e.clientY };
      editor.document.update(this.draft);
      editor.renderShapes();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
    }
  };

  // editor-engine/core/tools/RectangleTool.ts
  var RectangleTool = class {
    constructor() {
      this.id = "rectangle";
    }
    onPointerDown(e, { editor }) {
      this.draft = {
        id: crypto.randomUUID(),
        kind: this.id,
        p1: { x: e.clientX, y: e.clientY },
        rotation: 0,
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      if (!this.draft) return;
      const width = e.clientX - this.draft.p1.x;
      const height = e.clientY - this.draft.p1.y;
      this.draft.width = width;
      this.draft.height = height;
      editor.document.update(this.draft);
      editor.renderShapes();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
    }
  };

  // editor-engine/core/tools/EllipseTool.ts
  var EllipseTool = class {
    constructor() {
      this.id = "ellipse";
    }
    onPointerDown(e, { editor }) {
      this.draft = {
        id: crypto.randomUUID(),
        kind: this.id,
        p1: { x: e.clientX, y: e.clientY },
        rotation: 0,
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      if (!this.draft) return;
      const width = e.clientX - this.draft.p1.x;
      const height = e.clientY - this.draft.p1.y;
      this.draft.width = width;
      this.draft.height = height;
      editor.document.update(this.draft);
      editor.renderShapes();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
    }
  };

  // editor-engine/adapters/CanvasRenderer.ts
  var CanvasRenderer = class {
    constructor({
      canvas,
      editor
    }) {
      this.canvas = canvas;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D rendering context from canvas");
      }
      this.ctx = ctx;
      this.editor = editor;
    }
    renderShapes() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.editor.document.getAll().forEach((shape) => {
        this.renderShape(shape);
      });
    }
    renderShape(shape) {
      this.ctx.save();
      this.ctx.fillStyle = shape.fillStyle;
      this.ctx.strokeStyle = shape.strokeStyle;
      switch (shape.kind) {
        case "rectangle":
          this.renderRectangle(shape);
          break;
        case "ellipse":
          this.renderEllipse(shape);
          break;
        case "line":
          this.renderLine(shape);
          break;
      }
      this.ctx.restore();
    }
    renderRectangle(shape) {
      var _a;
      if (shape.width === void 0 || shape.height === void 0) {
        console.warn("Rectangle missing dimensions:", shape.id);
        return;
      }
      const center = this.calculateCenter(shape.p1, shape.width, shape.height);
      this.applyTransform(center, (_a = shape.rotation) != null ? _a : 0);
      const path = new Path2D();
      path.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
      this.ctx.fill(path);
    }
    renderEllipse(shape) {
      var _a;
      if (shape.width === void 0 || shape.height === void 0) {
        console.warn("Ellipse missing dimensions:", shape.id);
        return;
      }
      const center = this.calculateCenter(shape.p1, shape.width, shape.height);
      this.applyTransform(center, (_a = shape.rotation) != null ? _a : 0);
      const path = new Path2D();
      path.ellipse(
        0,
        0,
        Math.abs(shape.width) / 2,
        Math.abs(shape.height) / 2,
        0,
        0,
        2 * Math.PI
      );
      this.ctx.fill(path);
    }
    renderLine(shape) {
      var _a;
      if (!shape.p2) {
        console.warn("Line missing p2 point:", shape.id);
        return;
      }
      const center = this.calculateMidpoint(shape.p1, shape.p2);
      this.ctx.lineWidth = (_a = shape.lineWidth) != null ? _a : 1;
      this.ctx.translate(center.x, center.y);
      const path = new Path2D();
      path.moveTo(shape.p1.x - center.x, shape.p1.y - center.y);
      path.lineTo(shape.p2.x - center.x, shape.p2.y - center.y);
      this.ctx.stroke(path);
    }
    calculateCenter(p1, width, height) {
      return {
        x: p1.x + width / 2,
        y: p1.y + height / 2
      };
    }
    calculateMidpoint(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
    }
    applyTransform(center, rotation) {
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rotation);
    }
    renderSelectionBox(box) {
    }
    clearSelectionBox() {
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map