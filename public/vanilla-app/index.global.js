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
      hoverOutlineWidth: 1,
      selectionBoxStrokeColor: "#0D99FF",
      selectionBoxStrokeSize: 1,
      selectionBoxFillColor: "#0D99FF1A"
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
      this.selectionBounds = void 0;
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

  // editor-engine/core/tools/select/states/IdleState.ts
  var IdleState = class {
    onPointerDown(e, ctx) {
    }
    onPointerMove(e, { editor }) {
      var _a, _b, _c;
      let hoveringOnShape = false;
      if (editor.state.hoveredShapeId) {
        const hoveredShape = editor.document.getById(editor.state.hoveredShapeId);
        if (hoveredShape && ((_b = (_a = editor.renderer) == null ? void 0 : _a.getHitTestAdapter()) == null ? void 0 : _b.testShape(hoveredShape, e.clientX, e.clientY))) {
          hoveringOnShape = true;
        }
      }
      if (!hoveringOnShape) {
        editor.state.hoveredShapeId = (_c = editor.document.getAll().find(
          (shape) => {
            var _a2, _b2;
            return (_b2 = (_a2 = editor.renderer) == null ? void 0 : _a2.getHitTestAdapter()) == null ? void 0 : _b2.testShape(shape, e.clientX, e.clientY);
          }
        )) == null ? void 0 : _c.id;
      }
    }
    onPointerUp(e, ctx) {
    }
  };

  // editor-engine/core/services/BoundingBoxService.ts
  var BoundingBoxService = class {
    static getAABB(shape) {
      return shape.kind === "line" ? this.getAABBForLine(shape) : this.getAABBForRectangle(shape);
    }
    /**
     * Calculate AABB for rectangle or ellipse shapes
     * Handles rotation by computing the bounding box of all rotated corners
     */
    static getAABBForRectangle(shape) {
      const hw = shape.local.width / 2;
      const hh = shape.local.height / 2;
      const cx = shape.transform.x + hw;
      const cy = shape.transform.y + hh;
      const cos = Math.cos(shape.transform.rotation);
      const sin = Math.sin(shape.transform.rotation);
      const corners = [
        { x: -hw, y: -hh },
        // Top-left
        { x: hw, y: -hh },
        // Top-right
        { x: hw, y: hh },
        // Bottom-right
        { x: -hw, y: hh }
        // Bottom-left
      ];
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of corners) {
        const x = p.x * cos - p.y * sin + cx;
        const y = p.x * sin + p.y * cos + cy;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      return { minX, minY, maxX, maxY };
    }
    /**
     * Calculate AABB for line shapes
     * Includes stroke width padding
     */
    static getAABBForLine(shape) {
      const x1 = shape.transform.x + shape.local.x1;
      const y1 = shape.transform.y + shape.local.y1;
      const x2 = shape.transform.x + shape.local.x2;
      const y2 = shape.transform.y + shape.local.y2;
      let minX = Math.min(x1, x2);
      let minY = Math.min(y1, y2);
      let maxX = Math.max(x1, x2);
      let maxY = Math.max(y1, y2);
      if (shape.lineWidth > 0) {
        const pad = shape.lineWidth / 2;
        minX -= pad;
        minY -= pad;
        maxX += pad;
        maxY += pad;
      }
      return { minX, minY, maxX, maxY };
    }
    /**
     * Compute union of multiple AABBs
     */
    static unionAABBs(aabbs) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const b of aabbs) {
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
      }
      return { minX, minY, maxX, maxY };
    }
    /**
     * Check if two AABBs intersect
     */
    static aabbIntersects(a, b) {
      return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
    }
    /**
     * Check if a line segment intersects an AABB using Liang-Barsky algorithm
     * @see https://www.geeksforgeeks.org/computer-graphics/liang-barsky-algorithm/
     */
    static lineIntersectsAABB(x1, y1, x2, y2, box) {
      let t0 = 0;
      let t1 = 1;
      const dx = x2 - x1;
      const dy = y2 - y1;
      function clip(p, q) {
        if (p === 0) {
          return q >= 0;
        }
        const r = q / p;
        if (p < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
        return true;
      }
      if (!clip(-dx, x1 - box.minX)) return false;
      if (!clip(dx, box.maxX - x1)) return false;
      if (!clip(-dy, y1 - box.minY)) return false;
      if (!clip(dy, box.maxY - y1)) return false;
      return t0 <= t1;
    }
  };

  // editor-engine/core/tools/select/helpers/SelectionBoundsHelper.ts
  var SelectionBoundsHelper = class {
    static updateSelectionBounds(ctx) {
      const { editor } = ctx;
      const selectedShapesAABB = [];
      editor.state.selectionBounds = void 0;
      editor.selection.getAll().forEach((shapeId) => {
        const shape = editor.document.getById(shapeId);
        if (shape) {
          selectedShapesAABB.push(BoundingBoxService.getAABB(shape));
        }
      });
      if (selectedShapesAABB.length > 0) {
        editor.state.selectionBounds = BoundingBoxService.unionAABBs(selectedShapesAABB);
      }
    }
    static clearSelectionBounds(ctx) {
      ctx.editor.state.selectionBounds = void 0;
    }
  };

  // editor-engine/core/tools/select/states/DragState.ts
  var DragState = class {
    constructor() {
      this.prevMouseX = 0;
      this.prevMouseY = 0;
    }
    onPointerDown(e, ctx) {
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
    onPointerMove(e, ctx) {
      var _a;
      const { editor } = ctx;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      editor.selection.getAll().forEach((shapeId) => {
        const shape = editor.document.getById(shapeId);
        if (shape) {
          shape.transform.x += deltaX;
          shape.transform.y += deltaY;
          editor.document.update(shape);
        }
      });
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
    }
    onPointerUp(e, ctx) {
    }
  };

  // editor-engine/core/tools/select/states/MarqueeState.ts
  var MarqueeState = class {
    constructor() {
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, ctx) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.draft = {
        id: crypto.randomUUID(),
        kind: "rectangle",
        fillStyle: "",
        strokeStyle: "",
        transform: { x: this.mouseStart.x, y: this.mouseStart.y, rotation: 0 },
        local: { width: 0, height: 0 }
      };
    }
    onPointerMove(e, { editor }) {
      if (this.draft) {
        if (!this.draft) return;
        const minX = Math.min(this.mouseStart.x, e.clientX);
        const maxX = Math.max(this.mouseStart.x, e.clientX);
        const minY = Math.min(this.mouseStart.y, e.clientY);
        const maxY = Math.max(this.mouseStart.y, e.clientY);
        this.draft.transform.x = minX;
        this.draft.transform.y = minY;
        this.draft.local.width = maxX - minX;
        this.draft.local.height = maxY - minY;
        editor.state.marquee = BoundingBoxService.getAABB(this.draft);
      }
    }
    onPointerUp(e, { editor }) {
      var _a;
      if (editor.state.marquee) {
        const marquee = (_a = editor.state.marquee) != null ? _a : {};
        editor.document.getAll().forEach((shape) => {
          const intersect = shape.kind === "line" ? BoundingBoxService.lineIntersectsAABB(
            shape.transform.x + shape.local.x1,
            shape.transform.y + shape.local.y1,
            shape.transform.x + shape.local.x2,
            shape.transform.y + shape.local.y2,
            marquee
          ) : BoundingBoxService.aabbIntersects(
            marquee,
            BoundingBoxService.getAABB(shape)
          );
          if (intersect) {
            editor.selection.select(shape.id);
          }
        });
      }
      this.draft = void 0;
      editor.state.marquee = void 0;
      SelectionBoundsHelper.updateSelectionBounds({ editor });
    }
  };

  // editor-engine/core/tools/select/SelectTool.ts
  var SelectTool = class {
    constructor() {
      this.id = "select";
      this.currentState = new IdleState();
    }
    onPointerDown(e, ctx) {
      const nextState = this.determineNextState(e, ctx);
      this.transitionTo(nextState, ctx);
      this.currentState.onPointerDown(e, ctx);
      this.renderSelection(ctx);
    }
    onPointerMove(e, ctx) {
      this.currentState.onPointerMove(e, ctx);
      this.renderSelection(ctx);
    }
    onPointerUp(e, ctx) {
      this.currentState.onPointerUp(e, ctx);
      const next = new IdleState();
      this.transitionTo(next, ctx);
      this.currentState.onPointerUp(e, ctx);
      this.renderSelection(ctx);
    }
    transitionTo(state, ctx) {
      var _a, _b, _c, _d;
      (_b = (_a = this.currentState).onExit) == null ? void 0 : _b.call(_a, ctx);
      this.currentState = state;
      (_d = (_c = this.currentState).onEnter) == null ? void 0 : _d.call(_c, ctx);
    }
    determineNextState(e, { editor }) {
      if (editor.state.hoveredShapeId) {
        const shape = editor.document.getById(editor.state.hoveredShapeId);
        if (shape && editor.state.selectionBounds) {
          if (BoundingBoxService.aabbIntersects(
            editor.state.selectionBounds,
            BoundingBoxService.getAABB(shape)
          ))
            return new DragState();
        }
        if (e.shiftKey) editor.selection.select(editor.state.hoveredShapeId);
        else editor.selection.setSingle(editor.state.hoveredShapeId);
        SelectionBoundsHelper.updateSelectionBounds({ editor });
        return new DragState();
      }
      editor.selection.clear();
      editor.state.clearTransient();
      return new MarqueeState();
    }
    renderSelection(ctx) {
      var _a, _b, _c, _d;
      const { editor } = ctx;
      (_a = editor.renderer) == null ? void 0 : _a.clearSelectionBox();
      (_b = editor.renderer) == null ? void 0 : _b.renderHoverOutline();
      (_c = editor.renderer) == null ? void 0 : _c.renderSelectionBox();
      (_d = editor.renderer) == null ? void 0 : _d.renderSelectionBounds();
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
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor,
        transform: { x: e.clientX, y: e.clientY, rotation: 0 },
        local: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0
        },
        lineWidth: 4
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      this.draft.local.x2 = e.clientX - this.draft.transform.x;
      this.draft.local.y2 = e.clientY - this.draft.transform.y;
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
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, { editor }) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.draft = {
        id: crypto.randomUUID(),
        kind: "rectangle",
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor,
        transform: { x: this.mouseStart.x, y: this.mouseStart.y, rotation: 0 },
        local: { width: 0, height: 0 }
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      const minX = Math.min(this.mouseStart.x, e.clientX);
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
      const maxY = Math.max(this.mouseStart.y, e.clientY);
      this.draft.transform.x = minX;
      this.draft.transform.y = minY;
      this.draft.local.width = maxX - minX;
      this.draft.local.height = maxY - minY;
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
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, { editor }) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.draft = {
        id: crypto.randomUUID(),
        kind: "ellipse",
        fillStyle: editor.state.toolOptions.fillColor,
        strokeStyle: editor.state.toolOptions.strokeColor,
        transform: { x: this.mouseStart.x, y: this.mouseStart.y, rotation: 0 },
        local: { width: 0, height: 0 }
      };
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor }) {
      var _a;
      if (!this.draft) return;
      const minX = Math.min(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const maxY = Math.max(this.mouseStart.y, e.clientY);
      this.draft.transform.x = minX;
      this.draft.transform.y = minY;
      this.draft.local.width = maxX - minX;
      this.draft.local.height = maxY - minY;
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
    static getPathFromAABB(box) {
      const path = new Path2D();
      const width = box.maxX - box.minX;
      const height = box.maxY - box.minY;
      path.rect(box.minX, box.minY, width, height);
      return path;
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
      path.rect(0, 0, shape.local.width, shape.local.height);
      return path;
    }
    static createPathForEllipse(shape) {
      const path = new Path2D();
      path.ellipse(
        shape.local.width / 2,
        shape.local.height / 2,
        Math.abs(shape.local.width) / 2,
        Math.abs(shape.local.height) / 2,
        0,
        0,
        2 * Math.PI
      );
      return path;
    }
    static createPathForLine(shape) {
      const path = new Path2D();
      path.moveTo(shape.local.x1, shape.local.y1);
      path.lineTo(shape.local.x2, shape.local.y2);
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
      this.ctx.translate(shape.transform.x, shape.transform.y);
      this.ctx.rotate(shape.transform.rotation);
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
      this.ctx.translate(shape.transform.x, shape.transform.y);
      this.ctx.rotate(shape.transform.rotation);
      if (shape.kind === "line") {
        this.ctx.lineWidth = shape.lineWidth;
      } else this.ctx.fill(path);
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    applyTransform(center, rotation) {
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rotation);
    }
    renderHoverOutline() {
      if (!this.editor.state.hoveredShapeId) return;
      const hoveredShape = this.editor.document.getById(
        this.editor.state.hoveredShapeId
      );
      if (!hoveredShape) return;
      this.ctx.save();
      this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor;
      this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth;
      const path = CanvasPathBuilder.getPath(hoveredShape);
      this.ctx.translate(hoveredShape.transform.x, hoveredShape.transform.y);
      this.ctx.rotate(hoveredShape.transform.rotation);
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    renderSelectionBox() {
      if (!this.editor.state.marquee) return;
      this.ctx.save();
      const path = CanvasPathBuilder.getPathFromAABB(this.editor.state.marquee);
      this.ctx.strokeStyle = EditorConfig.renderOptions.selectionBoxStrokeColor;
      this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize;
      this.ctx.fillStyle = EditorConfig.renderOptions.selectionBoxFillColor;
      this.ctx.stroke(path);
      this.ctx.fill(path);
      this.ctx.restore();
    }
    renderSelectionBounds() {
      if (!this.editor.state.selectionBounds) return;
      this.ctx.save();
      const path = CanvasPathBuilder.getPathFromAABB(
        this.editor.state.selectionBounds
      );
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize;
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    clearSelectionBox() {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map