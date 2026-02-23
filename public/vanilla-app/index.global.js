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

  // editor-engine/config/EditorConfig.ts
  var EditorConfig = {
    defaultToolOptions: {
      strokeColor: "#ff9f22",
      fillColor: "#ff9f22"
    },
    renderOptions: {
      hoverOutlineColor: "#00aaff",
      hoverOutlineWidth: 2
    }
  };

  // editor-engine/core/EditorState.ts
  var EditorState = class {
    constructor() {
      this.toolOptions = {
        strokeColor: EditorConfig.defaultToolOptions.strokeColor,
        fillColor: EditorConfig.defaultToolOptions.fillColor
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
  };

  // editor-engine/core/tools/SelectTool.ts
  var SelectTool = class {
    constructor() {
      this.id = "select";
    }
    onPointerDown(e, { editor }) {
      if (!editor.state.hoveredShapeId) {
        editor.selection.clear();
      }
    }
    onPointerMove(e, { editor }) {
      var _a, _b, _c, _d;
      if (editor.state.hoveredShapeId) {
        const hoveredShape = editor.document.getById(editor.state.hoveredShapeId);
        if (hoveredShape && ((_b = (_a = editor.renderer) == null ? void 0 : _a.getHitTestAdapter()) == null ? void 0 : _b.testShape(hoveredShape, e.clientX, e.clientY))) {
          return;
        }
      }
      editor.state.hoveredShapeId = (_c = editor.document.getAll().find(
        (shape) => {
          var _a2, _b2;
          return (_b2 = (_a2 = editor.renderer) == null ? void 0 : _a2.getHitTestAdapter()) == null ? void 0 : _b2.testShape(shape, e.clientX, e.clientY);
        }
      )) == null ? void 0 : _c.id;
      (_d = editor.renderer) == null ? void 0 : _d.renderHoverOutline();
    }
    onPointerUp(e, { editor }) {
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
        p2: { x: 0, y: 0 },
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor,
        lineWidth: 4
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      this.draft.p2 = { x: e.clientX, y: e.clientY };
      editor.document.update(this.draft);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
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
        kind: "rectangle",
        p1: { x: e.clientX, y: e.clientY },
        rotation: 0,
        width: 0,
        height: 0,
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      const width = e.clientX - this.draft.p1.x;
      const height = e.clientY - this.draft.p1.y;
      this.draft.width = width;
      this.draft.height = height;
      editor.document.update(this.draft);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
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
        width: 0,
        height: 0,
        rotation: 0,
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      const width = e.clientX - this.draft.p1.x;
      const height = e.clientY - this.draft.p1.y;
      this.draft.width = width;
      this.draft.height = height;
      editor.document.update(this.draft);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
    }
  };

  // editor-engine/adapters/CanvasPathBuilder.ts
  var CanvasPathBuilder = class {
    constructor() {
    }
    static getPath(shape) {
      switch (shape.kind) {
        case "rectangle":
          return this.createPathForRectangle(shape);
        case "ellipse":
          return this.createPathForEllipse(shape);
        case "line":
          return this.createPathForLine(shape);
      }
    }
    static getShapeCenter(shape) {
      if (shape.kind === "line") {
        return {
          x: (shape.p1.x + shape.p2.x) / 2,
          y: (shape.p1.y + shape.p2.y) / 2
        };
      }
      return {
        x: shape.p1.x + shape.width / 2,
        y: shape.p1.y + shape.height / 2
      };
    }
    static getRotation(shape) {
      return shape.kind === "line" ? 0 : shape.rotation;
    }
    static createPathForRectangle(shape) {
      const path = new Path2D();
      path.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
      return path;
    }
    static createPathForEllipse(shape) {
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
      return path;
    }
    static createPathForLine(shape) {
      const path = new Path2D();
      const center = this.getShapeCenter(shape);
      path.moveTo(shape.p1.x - center.x, shape.p1.y - center.y);
      path.lineTo(shape.p2.x - center.x, shape.p2.y - center.y);
      return path;
    }
  };

  // editor-engine/adapters/CanvasHitTestAdapter.ts
  var CanvasHitTestAdapter = class {
    constructor(ctx) {
      this.ctx = ctx;
    }
    testShape(shape, x, y) {
      this.ctx.save();
      const center = CanvasPathBuilder.getShapeCenter(shape);
      const rotation = CanvasPathBuilder.getRotation(shape);
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rotation);
      this.ctx.lineWidth = 10;
      const path = CanvasPathBuilder.getPath(shape);
      const hitFound = shape.kind === "line" ? this.ctx.isPointInStroke(path, x, y) : this.ctx.isPointInPath(path, x, y);
      this.ctx.restore();
      return hitFound;
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
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.editor = editor;
      this.hitTestAdapter = new CanvasHitTestAdapter(this.ctx);
    }
    getHitTestAdapter() {
      return this.hitTestAdapter;
    }
    renderShapes() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.editor.document.getAll().forEach((shape) => {
        this.renderShape(shape);
      });
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    renderShape(shape) {
      this.ctx.save();
      this.ctx.fillStyle = shape.fillStyle;
      this.ctx.strokeStyle = shape.strokeStyle;
      const path = CanvasPathBuilder.getPath(shape);
      this.applyTransform(
        CanvasPathBuilder.getShapeCenter(shape),
        CanvasPathBuilder.getRotation(shape)
      );
      if (shape.kind === "line") {
        this.ctx.lineWidth = shape.lineWidth;
        this.ctx.stroke(path);
      } else this.ctx.fill(path);
      this.ctx.restore();
    }
    applyTransform(center, rotation) {
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rotation);
    }
    renderHoverOutline() {
      this.ctx.putImageData(this.imageData, 0, 0);
      if (!this.editor.state.hoveredShapeId) return;
      const hoveredShape = this.editor.document.getById(
        this.editor.state.hoveredShapeId
      );
      if (!hoveredShape) return;
      this.ctx.save();
      this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor;
      this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth;
      const path = CanvasPathBuilder.getPath(hoveredShape);
      this.applyTransform(
        CanvasPathBuilder.getShapeCenter(hoveredShape),
        CanvasPathBuilder.getRotation(hoveredShape)
      );
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    renderSelectionBox(box) {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    clearSelectionBox() {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map