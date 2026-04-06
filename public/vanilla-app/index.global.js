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
      this.ctx = {
        editor,
        renderOverlays: () => {
          var _a, _b, _c, _d;
          (_a = editor.renderer) == null ? void 0 : _a.clearSelectionBox();
          (_b = editor.renderer) == null ? void 0 : _b.renderHoverOutline();
          (_c = editor.renderer) == null ? void 0 : _c.renderSelectionBox();
          (_d = editor.renderer) == null ? void 0 : _d.renderSelectionHandles();
        }
      };
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
    },
    handleOptions: {
      cornerSize: 8,
      rotationPadding: 15,
      rotationRadius: 10,
      cornerFillColor: "#ffffff",
      cornerStrokeColor: "#000000",
      cornerStrokeWidth: 1,
      edgeStrokeColor: "#0D99FF",
      edgeStrokeWidth: 1,
      rotationFillColor: "#0D99FF",
      rotationStrokeColor: "#ffffff",
      rotationStrokeWidth: 1
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
      var _a;
      this.tools.setActive(tool);
      (_a = this.onToolChanged) == null ? void 0 : _a.call(this, tool);
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
    onKeyDown(e) {
      var _a;
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const handled = this.handleToolSelection(e);
        if (handled) {
          e.preventDefault();
          this.selection.clear();
          this.state.clearTransient();
          (_a = this.renderer) == null ? void 0 : _a.clearSelectionBox();
          return;
        }
      }
      this.tools.keyDown(e);
    }
    handleToolSelection(e) {
      var _a;
      const key = e.key.toLowerCase();
      const toolMap = {
        v: "select",
        r: "rectangle",
        o: "ellipse",
        l: "line"
      };
      const toolId = toolMap[key];
      if (toolId && ((_a = this.tools.getActive()) == null ? void 0 : _a.id) !== toolId) {
        this.setActiveTool(toolId);
        return true;
      }
      return false;
    }
    onKeyUp(e) {
      this.tools.keyUp(e);
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
     * Top-left based: calculate center from transform.x/y + dimensions
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
     * Top-left based: transform.x/y + local coords
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
    onPointerUp(e, ctx) {
      var _a;
      const { editor } = ctx;
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
      SelectionBoundsHelper.updateSelectionBounds(ctx);
    }
  };

  // editor-engine/core/tools/select/states/ResizeState.ts
  var ResizeState = class {
    constructor(handleType) {
      this.handleType = handleType;
      this.startMouse = { x: 0, y: 0 };
      this.originalShapes = /* @__PURE__ */ new Map();
    }
    onEnter(ctx) {
      const { editor } = ctx;
      editor.selection.getAll().forEach((shapeId) => {
        const shape = editor.document.getById(shapeId);
        if (shape) {
          this.originalShapes.set(shapeId, JSON.parse(JSON.stringify(shape)));
        }
      });
    }
    onPointerDown(e, ctx) {
      this.startMouse = { x: e.clientX, y: e.clientY };
    }
    onPointerMove(e, ctx) {
      var _a;
      const { editor } = ctx;
      const dx = e.clientX - this.startMouse.x;
      const dy = e.clientY - this.startMouse.y;
      const selection = editor.selection.getAll();
      if (selection.length === 1) {
        const shape = editor.document.getById(selection[0]);
        const original = this.originalShapes.get(selection[0]);
        if (!shape || !original) return;
        this.resizeSingleShape(shape, original, dx, dy, this.handleType);
        editor.document.update(shape);
      } else if (selection.length > 1 && editor.state.selectionBounds) {
        this.resizeMultipleShapes(editor, dx, dy, this.handleType);
      }
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
      ctx.renderOverlays();
    }
    onPointerUp(e, ctx) {
    }
    resizeSingleShape(shape, original, dx, dy, handle) {
      if (shape.kind === "line" && original.kind === "line") {
        this.resizeLine(shape, original, dx, dy, handle);
      } else if ((shape.kind === "rectangle" || shape.kind === "ellipse") && (original.kind === "rectangle" || original.kind === "ellipse")) {
        this.resizeRectangular(shape, original, dx, dy, handle);
      }
    }
    resizeLine(shape, original, dx, dy, handle) {
      if (handle === "p1") {
        shape.local.x1 = original.local.x1 + dx;
        shape.local.y1 = original.local.y1 + dy;
      } else if (handle === "p2") {
        shape.local.x2 = original.local.x2 + dx;
        shape.local.y2 = original.local.y2 + dy;
      }
    }
    resizeRectangular(shape, original, dx, dy, handle) {
      const cos = Math.cos(-shape.transform.rotation);
      const sin = Math.sin(-shape.transform.rotation);
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;
      switch (handle) {
        case "nw":
          shape.local.width = original.local.width - localDx;
          shape.local.height = original.local.height - localDy;
          shape.transform.x = original.transform.x + dx;
          shape.transform.y = original.transform.y + dy;
          break;
        case "ne":
          shape.local.width = original.local.width + localDx;
          shape.local.height = original.local.height - localDy;
          shape.transform.y = original.transform.y + dy;
          break;
        case "se":
          shape.local.width = original.local.width + localDx;
          shape.local.height = original.local.height + localDy;
          break;
        case "sw":
          shape.local.width = original.local.width - localDx;
          shape.local.height = original.local.height + localDy;
          shape.transform.x = original.transform.x + dx;
          break;
        case "n":
          shape.local.height = original.local.height - localDy;
          shape.transform.y = original.transform.y + dy;
          break;
        case "e":
          shape.local.width = original.local.width + localDx;
          break;
        case "s":
          shape.local.height = original.local.height + localDy;
          break;
        case "w":
          shape.local.width = original.local.width - localDx;
          shape.transform.x = original.transform.x + dx;
          break;
      }
      if (shape.local.width < 1) shape.local.width = 1;
      if (shape.local.height < 1) shape.local.height = 1;
    }
    resizeMultipleShapes(editor, dx, dy, handle) {
      console.log("Multi-shape resize not yet implemented");
    }
  };

  // editor-engine/core/tools/select/states/RotateState.ts
  var RotateState = class {
    constructor(handleType) {
      this.handleType = handleType;
      this.startMouse = { x: 0, y: 0 };
      this.centerPoint = { x: 0, y: 0 };
      this.startAngle = 0;
      this.originalTransforms = /* @__PURE__ */ new Map();
    }
    onEnter(ctx) {
      const { editor } = ctx;
      const selection = editor.selection.getAll();
      if (selection.length === 1) {
        const shape = editor.document.getById(selection[0]);
        if (shape) {
          this.centerPoint = this.getShapeCenter(shape);
          this.originalTransforms.set(shape.id, {
            x: shape.transform.x,
            y: shape.transform.y,
            rotation: shape.transform.rotation
          });
        }
      } else if (editor.state.selectionBounds) {
        const bounds = editor.state.selectionBounds;
        this.centerPoint = {
          x: bounds.minX + (bounds.maxX - bounds.minX) / 2,
          y: bounds.minY + (bounds.maxY - bounds.minY) / 2
        };
        selection.forEach((shapeId) => {
          const shape = editor.document.getById(shapeId);
          if (shape) {
            this.originalTransforms.set(shape.id, {
              x: shape.transform.x,
              y: shape.transform.y,
              rotation: shape.transform.rotation
            });
          }
        });
      }
    }
    onPointerDown(e, ctx) {
      this.startMouse = { x: e.clientX, y: e.clientY };
      this.startAngle = this.calculateAngle(
        this.startMouse.x,
        this.startMouse.y,
        this.centerPoint.x,
        this.centerPoint.y
      );
    }
    onPointerMove(e, ctx) {
      var _a;
      const { editor } = ctx;
      const currentAngle = this.calculateAngle(
        e.clientX,
        e.clientY,
        this.centerPoint.x,
        this.centerPoint.y
      );
      const deltaAngle = currentAngle - this.startAngle;
      const selection = editor.selection.getAll();
      if (selection.length === 1) {
        const shape = editor.document.getById(selection[0]);
        if (shape) {
          const original = this.originalTransforms.get(shape.id);
          if (original) {
            if (shape.kind === "rectangle" || shape.kind === "ellipse") {
              shape.transform.rotation = original.rotation + deltaAngle;
            } else if (shape.kind === "line") {
              const centerWorldX = shape.transform.x + (shape.local.x1 + shape.local.x2) / 2;
              const centerWorldY = shape.transform.y + (shape.local.y1 + shape.local.y2) / 2;
              const dx = shape.local.x1 - (shape.local.x1 + shape.local.x2) / 2;
              const dy = shape.local.y1 - (shape.local.y1 + shape.local.y2) / 2;
              const radius = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(
                e.clientY - centerWorldY,
                e.clientX - centerWorldX
              );
              const centerLocalX = (shape.local.x1 + shape.local.x2) / 2;
              const centerLocalY = (shape.local.y1 + shape.local.y2) / 2;
              shape.local.x2 = centerLocalX + radius * Math.cos(angle);
              shape.local.y2 = centerLocalY + radius * Math.sin(angle);
              shape.local.x1 = centerLocalX - radius * Math.cos(angle);
              shape.local.y1 = centerLocalY - radius * Math.sin(angle);
            }
            editor.document.update(shape);
          }
        }
      } else {
        selection.forEach((shapeId) => {
          const shape = editor.document.getById(shapeId);
          if (shape) {
            const original = this.originalTransforms.get(shape.id);
            if (original) {
              const rotatedPos = this.rotatePoint(
                original.x,
                original.y,
                this.centerPoint.x,
                this.centerPoint.y,
                deltaAngle
              );
              shape.transform.x = rotatedPos.x;
              shape.transform.y = rotatedPos.y;
              shape.transform.rotation = original.rotation + deltaAngle;
              editor.document.update(shape);
            }
          }
        });
      }
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
      ctx.renderOverlays();
    }
    onPointerUp(e, ctx) {
    }
    calculateAngle(x, y, centerX, centerY) {
      return Math.atan2(y - centerY, x - centerX);
    }
    rotatePoint(x, y, centerX, centerY, angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = x - centerX;
      const dy = y - centerY;
      return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos
      };
    }
    getShapeCenter(shape) {
      if (shape.kind === "line") {
        const midX = (shape.local.x1 + shape.local.x2) / 2;
        const midY = (shape.local.y1 + shape.local.y2) / 2;
        return {
          x: shape.transform.x + midX,
          y: shape.transform.y + midY
        };
      } else {
        return {
          x: shape.transform.x + shape.local.width / 2,
          y: shape.transform.y + shape.local.height / 2
        };
      }
    }
  };

  // editor-engine/core/services/HandleHitTestService.ts
  var HandleHitTestService = class {
    /**
     * Test if mouse position hits any handle
     * Mouse coordinates should be in world space
     */
    static testHandles(mouseX, mouseY, geometry, centerX, centerY, rotation = 0) {
      const localMouse = this.worldToLocal(
        mouseX,
        mouseY,
        centerX,
        centerY,
        rotation
      );
      for (const [key, handle] of Object.entries(geometry.rotation)) {
        if (this.isPointInCircle(localMouse.x, localMouse.y, handle)) {
          return { type: "rotation", handle: key };
        }
      }
      for (const [key, handle] of Object.entries(geometry.corners)) {
        if (this.isPointInRect(localMouse.x, localMouse.y, handle)) {
          return { type: "corner", handle: key };
        }
      }
      for (const [key, edge] of Object.entries(geometry.edges)) {
        if (this.isPointNearLine(localMouse.x, localMouse.y, edge)) {
          return { type: "edge", handle: key };
        }
      }
      return { type: null, handle: null };
    }
    /**
     * Transform world coordinates to local space
     */
    static worldToLocal(worldX, worldY, centerX, centerY, rotation) {
      const tx = worldX - centerX;
      const ty = worldY - centerY;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      return {
        x: tx * cos - ty * sin,
        y: tx * sin + ty * cos
      };
    }
    /**
     * Check if point is inside a circle
     */
    static isPointInCircle(x, y, circle) {
      const dx = x - circle.x;
      const dy = y - circle.y;
      return dx * dx + dy * dy <= circle.radius * circle.radius;
    }
    /**
     * Check if point is inside a rectangle (corner handle)
     */
    static isPointInRect(x, y, rect) {
      const halfSize = rect.size / 2;
      return x >= rect.x - halfSize && x <= rect.x + halfSize && y >= rect.y - halfSize && y <= rect.y + halfSize;
    }
    /**
     * Check if point is near a line (edge handle)
     */
    static isPointNearLine(x, y, line, threshold = 5) {
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared === 0) {
        const dist = Math.sqrt((x - line.x1) ** 2 + (y - line.y1) ** 2);
        return dist <= threshold;
      }
      let t = ((x - line.x1) * dx + (y - line.y1) * dy) / lengthSquared;
      t = Math.max(0, Math.min(1, t));
      const closestX = line.x1 + t * dx;
      const closestY = line.y1 + t * dy;
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
      return distance <= threshold;
    }
    /**
     * Get center position for a shape
     * Top-left based: calculate center from transform.x/y + dimensions
     */
    static getShapeCenter(shape) {
      if (shape.kind === "line") {
        return {
          x: shape.transform.x + (shape.local.x1 + shape.local.x2) / 2,
          y: shape.transform.y + (shape.local.y1 + shape.local.y2) / 2
        };
      }
      return {
        x: shape.transform.x + shape.local.width / 2,
        y: shape.transform.y + shape.local.height / 2
      };
    }
    /**
     * Get center position for an AABB
     */
    static getAABBCenter(aabb) {
      return {
        x: aabb.minX + (aabb.maxX - aabb.minX) / 2,
        y: aabb.minY + (aabb.maxY - aabb.minY) / 2
      };
    }
  };

  // editor-engine/core/services/HandleGeometryService.ts
  var HandleGeometryService = class {
    static getAABBHandleGeometry(aabb) {
      const width = aabb.maxX - aabb.minX;
      const height = aabb.maxY - aabb.minY;
      const halfW = width / 2;
      const halfH = height / 2;
      const centerX = aabb.minX + halfW;
      const centerY = aabb.minY + halfH;
      return {
        corners: {
          nw: {
            x: -halfW,
            y: -halfH,
            size: EditorConfig.handleOptions.cornerSize
          },
          ne: {
            x: halfW,
            y: -halfH,
            size: EditorConfig.handleOptions.cornerSize
          },
          se: { x: halfW, y: halfH, size: EditorConfig.handleOptions.cornerSize },
          sw: {
            x: -halfW,
            y: halfH,
            size: EditorConfig.handleOptions.cornerSize
          }
        },
        edges: {
          n: { x1: -halfW, y1: -halfH, x2: halfW, y2: -halfH },
          e: { x1: halfW, y1: -halfH, x2: halfW, y2: halfH },
          s: { x1: halfW, y1: halfH, x2: -halfW, y2: halfH },
          w: { x1: -halfW, y1: halfH, x2: -halfW, y2: -halfH }
        },
        rotation: {
          nw: {
            x: -halfW - EditorConfig.handleOptions.rotationPadding,
            y: -halfH - EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          ne: {
            x: halfW + EditorConfig.handleOptions.rotationPadding,
            y: -halfH - EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          se: {
            x: halfW + EditorConfig.handleOptions.rotationPadding,
            y: halfH + EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          sw: {
            x: -halfW - EditorConfig.handleOptions.rotationPadding,
            y: halfH + EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          }
        }
      };
    }
    static getShapeHandleGeometry(shape) {
      if (shape.kind === "line") {
        return this.getLineHandleGeometry(shape);
      }
      return this.getRectangularHandleGeometry(shape);
    }
    static getLineHandleGeometry(shape) {
      const centerX = (shape.local.x1 + shape.local.x2) / 2;
      const centerY = (shape.local.y1 + shape.local.y2) / 2;
      const relP1X = shape.local.x1 - centerX;
      const relP1Y = shape.local.y1 - centerY;
      const relP2X = shape.local.x2 - centerX;
      const relP2Y = shape.local.y2 - centerY;
      const length = Math.sqrt(
        Math.pow(shape.local.x2 - shape.local.x1, 2) + Math.pow(shape.local.y2 - shape.local.y1, 2)
      );
      const dirP1X = length > 0 ? relP1X / (length / 2) : 0;
      const dirP1Y = length > 0 ? relP1Y / (length / 2) : 0;
      const dirP2X = length > 0 ? relP2X / (length / 2) : 0;
      const dirP2Y = length > 0 ? relP2Y / (length / 2) : 0;
      return {
        corners: {
          p1: {
            x: relP1X,
            y: relP1Y,
            size: EditorConfig.handleOptions.cornerSize
          },
          p2: {
            x: relP2X,
            y: relP2Y,
            size: EditorConfig.handleOptions.cornerSize
          }
        },
        edges: {},
        // Lines don't have edge handles
        rotation: {
          p1: {
            x: relP1X + dirP1X * EditorConfig.handleOptions.rotationPadding,
            y: relP1Y + dirP1Y * EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          p2: {
            x: relP2X + dirP2X * EditorConfig.handleOptions.rotationPadding,
            y: relP2Y + dirP2Y * EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          }
        }
      };
    }
    static getRectangularHandleGeometry(shape) {
      const halfW = shape.local.width / 2;
      const halfH = shape.local.height / 2;
      return {
        corners: {
          nw: {
            x: -halfW,
            y: -halfH,
            size: EditorConfig.handleOptions.cornerSize
          },
          ne: {
            x: halfW,
            y: -halfH,
            size: EditorConfig.handleOptions.cornerSize
          },
          se: { x: halfW, y: halfH, size: EditorConfig.handleOptions.cornerSize },
          sw: {
            x: -halfW,
            y: halfH,
            size: EditorConfig.handleOptions.cornerSize
          }
        },
        edges: {
          n: { x1: -halfW, y1: -halfH, x2: halfW, y2: -halfH },
          e: { x1: halfW, y1: -halfH, x2: halfW, y2: halfH },
          s: { x1: halfW, y1: halfH, x2: -halfW, y2: halfH },
          w: { x1: -halfW, y1: halfH, x2: -halfW, y2: -halfH }
        },
        rotation: {
          nw: {
            x: -halfW - EditorConfig.handleOptions.rotationPadding,
            y: -halfH - EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          ne: {
            x: halfW + EditorConfig.handleOptions.rotationPadding,
            y: -halfH - EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          se: {
            x: halfW + EditorConfig.handleOptions.rotationPadding,
            y: halfH + EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          },
          sw: {
            x: -halfW - EditorConfig.handleOptions.rotationPadding,
            y: halfH + EditorConfig.handleOptions.rotationPadding,
            radius: EditorConfig.handleOptions.rotationRadius
          }
        }
      };
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
      ctx.renderOverlays();
    }
    onPointerMove(e, ctx) {
      this.currentState.onPointerMove(e, ctx);
      ctx.renderOverlays();
    }
    onPointerUp(e, ctx) {
      this.currentState.onPointerUp(e, ctx);
      const next = new IdleState();
      this.transitionTo(next, ctx);
      this.currentState.onPointerUp(e, ctx);
      ctx.renderOverlays();
    }
    onKeyDown(e, ctx) {
      if (e.key === "Delete" || e.key === "Backspace") {
        this.handleDelete(ctx);
        e.preventDefault();
      }
    }
    handleDelete(ctx) {
      var _a;
      const selectedIds = ctx.editor.selection.getAll();
      if (selectedIds.length === 0) return;
      selectedIds.forEach((id) => {
        ctx.editor.document.remove(id);
      });
      ctx.editor.selection.clear();
      ctx.editor.state.clearTransient();
      (_a = ctx.editor.renderer) == null ? void 0 : _a.renderShapes();
      ctx.renderOverlays();
    }
    transitionTo(state, ctx) {
      var _a, _b, _c, _d;
      (_b = (_a = this.currentState).onExit) == null ? void 0 : _b.call(_a, ctx);
      this.currentState = state;
      (_d = (_c = this.currentState).onEnter) == null ? void 0 : _d.call(_c, ctx);
    }
    determineNextState(e, ctx) {
      const { editor } = ctx;
      const handleHit = this.testHandleHit(e, editor);
      if (handleHit.type === "rotation" && handleHit.handle) {
        return new RotateState(handleHit.handle);
      }
      if ((handleHit.type === "corner" || handleHit.type === "edge") && handleHit.handle) {
        return new ResizeState(handleHit.handle);
      }
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
        SelectionBoundsHelper.updateSelectionBounds(ctx);
        return new DragState();
      }
      editor.selection.clear();
      editor.state.clearTransient();
      return new MarqueeState();
    }
    testHandleHit(e, editor) {
      const selection = editor.selection.getAll();
      if (editor.state.selectionBounds && selection.length > 1) {
        const geometry = HandleGeometryService.getAABBHandleGeometry(
          editor.state.selectionBounds
        );
        const center = HandleHitTestService.getAABBCenter(
          editor.state.selectionBounds
        );
        return HandleHitTestService.testHandles(
          e.clientX,
          e.clientY,
          geometry,
          center.x,
          center.y,
          0
          // AABB has no rotation
        );
      }
      if (selection.length === 1) {
        const shape = editor.document.getById(selection[0]);
        if (shape) {
          const geometry = HandleGeometryService.getShapeHandleGeometry(shape);
          const center = HandleHitTestService.getShapeCenter(shape);
          return HandleHitTestService.testHandles(
            e.clientX,
            e.clientY,
            geometry,
            center.x,
            center.y,
            shape.transform.rotation
          );
        }
      }
      return { type: null, handle: null };
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
      editor.selection.setSingle(this.draft.id);
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor, renderOverlays }) {
      var _a;
      if (!this.draft) return;
      this.draft.local.x2 = e.clientX - this.draft.transform.x;
      this.draft.local.y2 = e.clientY - this.draft.transform.y;
      editor.document.update(this.draft);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
      editor.setActiveTool("select");
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
      editor.selection.setSingle(this.draft.id);
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor, renderOverlays }) {
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
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
      editor.setActiveTool("select");
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
      editor.selection.setSingle(this.draft.id);
      editor.document.add(this.draft);
    }
    onPointerMove(e, { editor, renderOverlays }) {
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
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    onPointerUp(e, { editor }) {
      this.draft = void 0;
      editor.setActiveTool("select");
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
    static createPathForRectangle(shape) {
      const path = new Path2D();
      const halfW = shape.local.width / 2;
      const halfH = shape.local.height / 2;
      path.rect(-halfW, -halfH, shape.local.width, shape.local.height);
      return path;
    }
    static createPathForEllipse(shape) {
      const path = new Path2D();
      path.ellipse(
        0,
        0,
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
      const centerX = (shape.local.x1 + shape.local.x2) / 2;
      const centerY = (shape.local.y1 + shape.local.y2) / 2;
      path.moveTo(shape.local.x1 - centerX, shape.local.y1 - centerY);
      path.lineTo(shape.local.x2 - centerX, shape.local.y2 - centerY);
      return path;
    }
    static getHandlePaths(geometry) {
      const cornerPaths = {};
      const edgePaths = {};
      const rotationPaths = {};
      for (const [key, corner] of Object.entries(geometry.corners)) {
        const path = new Path2D();
        path.rect(
          corner.x - corner.size / 2,
          corner.y - corner.size / 2,
          corner.size,
          corner.size
        );
        cornerPaths[key] = path;
      }
      for (const [key, edge] of Object.entries(geometry.edges)) {
        const path = new Path2D();
        path.moveTo(edge.x1, edge.y1);
        path.lineTo(edge.x2, edge.y2);
        edgePaths[key] = path;
      }
      for (const [key, rotation] of Object.entries(geometry.rotation)) {
        const path = new Path2D();
        path.arc(rotation.x, rotation.y, rotation.radius, 0, Math.PI * 2);
        rotationPaths[key] = path;
      }
      return {
        corners: cornerPaths,
        edges: edgePaths,
        rotation: rotationPaths
      };
    }
  };

  // editor-engine/adapters/CanvasHitTestAdapter.ts
  var CanvasHitTestAdapter = class {
    constructor(ctx) {
      this.ctx = ctx;
    }
    testShape(shape, x, y) {
      this.ctx.save();
      const center = HandleHitTestService.getShapeCenter(shape);
      this.ctx.translate(center.x, center.y);
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
      let centerX = shape.transform.x;
      let centerY = shape.transform.y;
      if (shape.kind === "line") {
        centerX += (shape.local.x1 + shape.local.x2) / 2;
        centerY += (shape.local.y1 + shape.local.y2) / 2;
      } else {
        centerX += shape.local.width / 2;
        centerY += shape.local.height / 2;
      }
      this.ctx.translate(centerX, centerY);
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
      let centerX = hoveredShape.transform.x;
      let centerY = hoveredShape.transform.y;
      if (hoveredShape.kind === "line") {
        centerX += (hoveredShape.local.x1 + hoveredShape.local.x2) / 2;
        centerY += (hoveredShape.local.y1 + hoveredShape.local.y2) / 2;
      } else {
        centerX += hoveredShape.local.width / 2;
        centerY += hoveredShape.local.height / 2;
      }
      this.ctx.translate(centerX, centerY);
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
      const selection = this.editor.selection.getAll();
      if (!this.editor.state.selectionBounds || selection.length < 2) return;
      this.ctx.save();
      const path = CanvasPathBuilder.getPathFromAABB(
        this.editor.state.selectionBounds
      );
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = EditorConfig.renderOptions.selectionBoxStrokeSize;
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    renderSelectionHandles() {
      const selection = this.editor.selection.getAll();
      if (this.editor.state.selectionBounds && selection.length > 1) {
        const geometry = HandleGeometryService.getAABBHandleGeometry(
          this.editor.state.selectionBounds
        );
        const paths = CanvasPathBuilder.getHandlePaths(geometry);
        this.drawHandlesForAABB(paths, this.editor.state.selectionBounds);
      } else if (selection.length === 1) {
        const shape = this.editor.document.getById(selection[0]);
        if (shape) {
          const geometry = HandleGeometryService.getShapeHandleGeometry(shape);
          const paths = CanvasPathBuilder.getHandlePaths(geometry);
          this.drawHandlesForShape(paths, shape);
        }
      }
    }
    drawHandlesForAABB(paths, aabb) {
      const width = aabb.maxX - aabb.minX;
      const height = aabb.maxY - aabb.minY;
      const centerX = aabb.minX + width / 2;
      const centerY = aabb.minY + height / 2;
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor;
      this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth;
      for (const path of Object.values(paths.corners)) {
        this.ctx.fill(path);
        this.ctx.stroke(path);
      }
      this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth;
      for (const path of Object.values(paths.edges)) {
        this.ctx.stroke(path);
      }
      this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor;
      this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth;
      for (const path of Object.values(paths.rotation)) {
        this.ctx.fill(path);
        this.ctx.stroke(path);
      }
      this.ctx.restore();
    }
    drawHandlesForShape(paths, shape) {
      this.ctx.save();
      let centerX = shape.transform.x;
      let centerY = shape.transform.y;
      if (shape.kind === "rectangle" || shape.kind === "ellipse") {
        centerX += shape.local.width / 2;
        centerY += shape.local.height / 2;
      } else if (shape.kind === "line") {
        centerX += (shape.local.x1 + shape.local.x2) / 2;
        centerY += (shape.local.y1 + shape.local.y2) / 2;
      }
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(shape.transform.rotation);
      this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor;
      this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth;
      for (const path of Object.values(paths.corners)) {
        this.ctx.fill(path);
        this.ctx.stroke(path);
      }
      if (Object.keys(paths.edges).length > 0) {
        this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor;
        this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth;
        for (const path of Object.values(paths.edges)) {
          this.ctx.stroke(path);
        }
      }
      this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor;
      this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth;
      for (const path of Object.values(paths.rotation)) {
        this.ctx.fill(path);
        this.ctx.stroke(path);
      }
      this.ctx.restore();
    }
    clearSelectionBox() {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map