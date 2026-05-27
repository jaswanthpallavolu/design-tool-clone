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
    BoundingBoxService: () => BoundingBoxService,
    CanvasRenderer: () => CanvasRenderer,
    ClearCommand: () => ClearCommand,
    Command: () => Command,
    CommandManager: () => CommandManager,
    Document: () => Document,
    Editor: () => Editor,
    EditorState: () => EditorState,
    EllipseTool: () => EllipseTool,
    EventBus: () => EventBus,
    GroupService: () => GroupService,
    LineTool: () => LineTool,
    NodeType: () => NodeType,
    RectangleTool: () => RectangleTool,
    SelectTool: () => SelectTool,
    SelectionManager: () => SelectionManager,
    SetToolCommand: () => SetToolCommand,
    ShapeQueryService: () => ShapeQueryService,
    ShapeType: () => ShapeType,
    SpatialGrid: () => SpatialGrid,
    SpatialIndexService: () => SpatialIndexService,
    ToolManager: () => ToolManager,
    UpdateShapesStyleCommand: () => UpdateShapesStyleCommand,
    UpdateToolOptionsCommand: () => UpdateToolOptionsCommand,
    createEllipseShape: () => createEllipseShape,
    createGroupNode: () => createGroupNode,
    createLineShape: () => createLineShape,
    createRectangleShape: () => createRectangleShape,
    createShapeNode: () => createShapeNode,
    isEllipseShape: () => isEllipseShape,
    isGroupNode: () => isGroupNode,
    isLineShape: () => isLineShape,
    isRectangleShape: () => isRectangleShape,
    isShapeNode: () => isShapeNode
  });

  // editor-engine/core/model/Shape.ts
  var ShapeType = /* @__PURE__ */ ((ShapeType2) => {
    ShapeType2["RECTANGLE"] = "RECTANGLE";
    ShapeType2["ELLIPSE"] = "ELLIPSE";
    ShapeType2["LINE"] = "LINE";
    return ShapeType2;
  })(ShapeType || {});
  function isRectangleShape(shape) {
    return shape.type === "RECTANGLE" /* RECTANGLE */;
  }
  function isEllipseShape(shape) {
    return shape.type === "ELLIPSE" /* ELLIPSE */;
  }
  function isLineShape(shape) {
    return shape.type === "LINE" /* LINE */;
  }
  function createRectangleShape(nodeId, geometry, style) {
    return {
      nodeId,
      type: "RECTANGLE" /* RECTANGLE */,
      geometry,
      style
    };
  }
  function createEllipseShape(nodeId, geometry, style) {
    return {
      nodeId,
      type: "ELLIPSE" /* ELLIPSE */,
      geometry,
      style
    };
  }
  function createLineShape(nodeId, geometry, style) {
    return {
      nodeId,
      type: "LINE" /* LINE */,
      geometry,
      style
    };
  }

  // editor-engine/core/model/Node.ts
  var NodeType = /* @__PURE__ */ ((NodeType2) => {
    NodeType2["GROUP"] = "GROUP";
    NodeType2["SHAPE"] = "SHAPE";
    return NodeType2;
  })(NodeType || {});
  function isGroupNode(node) {
    return node.type === "GROUP" /* GROUP */;
  }
  function isShapeNode(node) {
    return node.type === "SHAPE" /* SHAPE */;
  }
  function countShapeNodesByType(existingNodes, existingShapes, shapeType) {
    const baseNames = {
      ["RECTANGLE" /* RECTANGLE */]: "Rectangle",
      ["ELLIPSE" /* ELLIPSE */]: "Ellipse",
      ["LINE" /* LINE */]: "Line"
    };
    const baseName = baseNames[shapeType];
    let count = 0;
    for (const node of existingNodes) {
      if (node.type === "SHAPE" /* SHAPE */) {
        const shape = existingShapes.get(node.id);
        if (shape && shape.type === shapeType) {
          const regex = new RegExp(`^${baseName}\\s*(\\d*)$`);
          const match = node.name.match(regex);
          if (match) {
            count++;
          }
        }
      }
    }
    return count;
  }
  function generateShapeNodeName(existingNodes, existingShapes, shapeType) {
    const baseNames = {
      ["RECTANGLE" /* RECTANGLE */]: "Rectangle",
      ["ELLIPSE" /* ELLIPSE */]: "Ellipse",
      ["LINE" /* LINE */]: "Line"
    };
    const baseName = baseNames[shapeType];
    const count = countShapeNodesByType(existingNodes, existingShapes, shapeType);
    return `${baseName} ${count}`;
  }
  function countGroupNodes(existingNodes) {
    const baseName = "Group";
    let count = 0;
    for (const node of existingNodes) {
      if (node.type === "GROUP" /* GROUP */) {
        const regex = new RegExp(`^${baseName}\\s*(\\d*)$`);
        const match = node.name.match(regex);
        if (match) {
          count++;
        }
      }
    }
    return count;
  }
  function generateGroupNodeName(existingNodes) {
    const count = countGroupNodes(existingNodes);
    return `Group ${count}`;
  }
  function createGroupNode(id, transform, options) {
    var _a, _b;
    let name = options == null ? void 0 : options.name;
    if (!name && (options == null ? void 0 : options.existingNodes)) {
      name = generateGroupNodeName(options.existingNodes);
    }
    return {
      id,
      type: "GROUP" /* GROUP */,
      name: name || "Group",
      parentId: options == null ? void 0 : options.parentId,
      children: [],
      transform,
      visible: (_a = options == null ? void 0 : options.visible) != null ? _a : true,
      locked: (_b = options == null ? void 0 : options.locked) != null ? _b : false
    };
  }
  function createShapeNode(id, transform, options) {
    var _a, _b;
    let name = options == null ? void 0 : options.name;
    if (!name && (options == null ? void 0 : options.existingNodes) && (options == null ? void 0 : options.existingShapes) && (options == null ? void 0 : options.shapeType)) {
      name = generateShapeNodeName(
        options.existingNodes,
        options.existingShapes,
        options.shapeType
      );
    }
    return {
      id,
      type: "SHAPE" /* SHAPE */,
      name: name || "Shape",
      parentId: options == null ? void 0 : options.parentId,
      children: [],
      transform,
      visible: (_a = options == null ? void 0 : options.visible) != null ? _a : true,
      locked: (_b = options == null ? void 0 : options.locked) != null ? _b : false
    };
  }

  // editor-engine/core/Document.ts
  var Document = class {
    constructor() {
      this.nodes = /* @__PURE__ */ new Map();
      this.shapes = /* @__PURE__ */ new Map();
    }
    // nodeId -> Shape
    // ---------------------------------------------
    // Node Queries
    // ---------------------------------------------
    getNode(id) {
      return this.nodes.get(id);
    }
    getAllNodes() {
      return Array.from(this.nodes.values());
    }
    hasNode(id) {
      return this.nodes.has(id);
    }
    getRootNodes() {
      return Array.from(this.nodes.values()).filter((n) => !n.parentId);
    }
    getChildren(parentId) {
      return Array.from(this.nodes.values()).filter(
        (n) => n.parentId === parentId
      );
    }
    getParent(childId) {
      const child = this.nodes.get(childId);
      return (child == null ? void 0 : child.parentId) ? this.nodes.get(child.parentId) : void 0;
    }
    /**
     * Get the top-level parent (root-level node) for a given node
     * If the node has no parent, returns the node itself
     */
    getTopLevelParent(nodeId) {
      let current = this.nodes.get(nodeId);
      if (!current) return void 0;
      while (current.parentId) {
        const parent = this.nodes.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    }
    // ---------------------------------------------
    // Shape Queries
    // ---------------------------------------------
    getShape(nodeId) {
      return this.shapes.get(nodeId);
    }
    getAllShapes() {
      return Array.from(this.shapes.values());
    }
    hasShape(nodeId) {
      return this.shapes.has(nodeId);
    }
    getShapesMap() {
      return this.shapes;
    }
    // ---------------------------------------------
    // Combined Queries (for convenience)
    // ---------------------------------------------
    /**
     * Get all nodes that are shapes (not groups)
     * Returns array of [node, shape] tuples
     */
    getShapeNodes() {
      const result = [];
      for (const node of this.nodes.values()) {
        if (node.type === "SHAPE" /* SHAPE */) {
          const shape = this.shapes.get(node.id);
          if (shape) {
            result.push([node, shape]);
          }
        }
      }
      return result;
    }
    // ---------------------------------------------
    // Node Commands
    // ---------------------------------------------
    addNode(node) {
      if (this.nodes.has(node.id)) {
        throw new Error(`Node with id '${node.id}' already exists`);
      }
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId);
        if (!parent) {
          throw new Error(`Parent node '${node.parentId}' does not exist`);
        }
        if (!isGroupNode(parent)) {
          throw new Error(`Parent node '${node.parentId}' is not a group`);
        }
        if (!parent.children.includes(node.id)) {
          parent.children.push(node.id);
        }
      }
      this.nodes.set(node.id, node);
    }
    removeNode(id) {
      const node = this.nodes.get(id);
      if (!node) return;
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId);
        if (parent && isGroupNode(parent)) {
          parent.children = parent.children.filter((childId) => childId !== id);
        }
      }
      this.shapes.delete(id);
      this.nodes.delete(id);
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.removeNode(childId);
        }
      }
    }
    updateNode(node) {
      if (!this.nodes.has(node.id)) {
        throw new Error(`Node with id '${node.id}' does not exist`);
      }
      this.nodes.set(node.id, node);
    }
    /**
     * Set the z-order of a node by moving it to a specific index
     * Higher index = higher z-order (drawn on top)
     */
    setNodeZOrder(nodeId, targetIndex) {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node with id '${nodeId}' does not exist`);
      }
      const nodesArray = Array.from(this.nodes.entries());
      const currentIndex = nodesArray.findIndex(([id]) => id === nodeId);
      if (currentIndex === -1) return;
      const [entry] = nodesArray.splice(currentIndex, 1);
      const clampedIndex = Math.max(0, Math.min(targetIndex, nodesArray.length));
      nodesArray.splice(clampedIndex, 0, entry);
      this.nodes.clear();
      for (const [id, node2] of nodesArray) {
        this.nodes.set(id, node2);
      }
    }
    /**
     * Move a node to a new parent (or root if parentId is undefined)
     */
    reparent(childId, newParentId) {
      const child = this.nodes.get(childId);
      if (!child) {
        throw new Error(`Child node '${childId}' does not exist`);
      }
      const oldParentId = child.parentId;
      if (oldParentId) {
        const oldParent = this.nodes.get(oldParentId);
        if (oldParent && isGroupNode(oldParent)) {
          oldParent.children = oldParent.children.filter((id) => id !== childId);
        }
      }
      child.parentId = newParentId;
      if (newParentId) {
        const newParent = this.nodes.get(newParentId);
        if (!newParent) {
          throw new Error(`New parent node '${newParentId}' does not exist`);
        }
        if (!isGroupNode(newParent)) {
          throw new Error(`New parent node '${newParentId}' is not a group`);
        }
        if (!newParent.children.includes(childId)) {
          newParent.children.push(childId);
        }
      }
    }
    // ---------------------------------------------
    // Shape Commands
    // ---------------------------------------------
    addShape(shape) {
      if (this.shapes.has(shape.nodeId)) {
        throw new Error(`Shape for node '${shape.nodeId}' already exists`);
      }
      const node = this.nodes.get(shape.nodeId);
      if (!node) {
        throw new Error(`Node '${shape.nodeId}' does not exist`);
      }
      if (node.type !== "SHAPE" /* SHAPE */) {
        throw new Error(`Node '${shape.nodeId}' is not a shape node`);
      }
      this.shapes.set(shape.nodeId, shape);
    }
    removeShape(nodeId) {
      this.shapes.delete(nodeId);
    }
    updateShape(shape) {
      if (!this.shapes.has(shape.nodeId)) {
        throw new Error(`Shape for node '${shape.nodeId}' does not exist`);
      }
      this.shapes.set(shape.nodeId, shape);
    }
    // ---------------------------------------------
    // Utility
    // ---------------------------------------------
    clear() {
      this.nodes.clear();
      this.shapes.clear();
    }
    // ---------------------------------------------
    // Debug
    // ---------------------------------------------
    /**
     * Print document tree in depth-first order
     * Last drawn shape appears first (reverse order)
     */
    debugTree() {
      console.log("Document Tree:");
      const roots = this.getRootNodes();
      for (const root of roots) {
        this.printNode(root.id, 0);
      }
    }
    printNode(nodeId, depth) {
      const node = this.nodes.get(nodeId);
      if (!node) return;
      const indent = "  ".repeat(depth);
      const type = node.type === "GROUP" /* GROUP */ ? "Group" : "Shape";
      console.log(`${indent}${type} ${node.name} (${node.id})`);
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.printNode(childId, depth + 1);
        }
      }
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
      this.hoveredNodeId = void 0;
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

  // editor-engine/core/services/BoundingBoxService.ts
  var BoundingBoxService = class {
    /**
     * Calculate AABB for a node + shape pair
     * Node provides transform (position, rotation), shape provides geometry
     */
    static getAABB(node, shape) {
      return shape.type === "LINE" ? this.getAABBForLine(node, shape) : this.getAABBForRectangle(node, shape);
    }
    /**
     * Calculate AABB for rectangle or ellipse shapes
     * Handles rotation by computing the bounding box of all rotated corners
     */
    static getAABBForRectangle(node, shape) {
      const hw = shape.geometry.width / 2;
      const hh = shape.geometry.height / 2;
      const cx = node.transform.x + hw;
      const cy = node.transform.y + hh;
      const cos = Math.cos(node.transform.rotation);
      const sin = Math.sin(node.transform.rotation);
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
    static getAABBForLine(node, shape) {
      const x1 = node.transform.x + shape.geometry.x1;
      const y1 = node.transform.y + shape.geometry.y1;
      const x2 = node.transform.x + shape.geometry.x2;
      const y2 = node.transform.y + shape.geometry.y2;
      let minX = Math.min(x1, x2);
      let minY = Math.min(y1, y2);
      let maxX = Math.max(x1, x2);
      let maxY = Math.max(y1, y2);
      if (shape.geometry.lineWidth > 0) {
        const pad = shape.geometry.lineWidth / 2;
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
    /**
     * Convert AABB to OBB (axis-aligned box with rotation = 0)
     */
    static aabbToOBB(aabb) {
      const width = aabb.maxX - aabb.minX;
      const height = aabb.maxY - aabb.minY;
      return {
        centerX: aabb.minX + width / 2,
        centerY: aabb.minY + height / 2,
        width,
        height,
        rotation: 0
      };
    }
    /**
     * Convert OBB to AABB (compute axis-aligned bounds of rotated box)
     */
    static obbToAABB(obb) {
      const hw = obb.width / 2;
      const hh = obb.height / 2;
      const cos = Math.cos(obb.rotation);
      const sin = Math.sin(obb.rotation);
      const corners = [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh }
      ];
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of corners) {
        const x = p.x * cos - p.y * sin + obb.centerX;
        const y = p.x * sin + p.y * cos + obb.centerY;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      return { minX, minY, maxX, maxY };
    }
    /**
     * Check if bounds is an OBB (has centerX property)
     */
    static isOBB(bounds) {
      return "centerX" in bounds;
    }
    /**
     * Get center point from either AABB or OBB
     */
    static getCenter(bounds) {
      if (this.isOBB(bounds)) {
        return { x: bounds.centerX, y: bounds.centerY };
      }
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      return {
        x: bounds.minX + width / 2,
        y: bounds.minY + height / 2
      };
    }
    /**
     * Get rotation from bounds (0 for AABB, actual rotation for OBB)
     */
    static getRotation(bounds) {
      return this.isOBB(bounds) ? bounds.rotation : 0;
    }
  };

  // editor-engine/core/services/GroupService.ts
  var GroupService = class {
    constructor(document) {
      this.document = document;
    }
    /**
     * Group multiple nodes into a new group node
     * Returns the ID of the newly created group
     */
    groupNodes(nodeIds) {
      const normalizedIds = this.normalizeSelectionForGrouping(nodeIds);
      if (!this.hasEnoughNodesToGroup(normalizedIds)) {
        return null;
      }
      const nodes = [];
      for (const id of normalizedIds) {
        const node = this.document.getNode(id);
        if (!node) {
          return null;
        }
        nodes.push(node);
      }
      const commonParentId = this.getGroupingParentId(normalizedIds);
      if (commonParentId === null) {
        return null;
      }
      const bounds = this.calculateBoundingBox(normalizedIds);
      if (!bounds) {
        return null;
      }
      const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const groupTransform = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
        rotation: 0
      };
      const groupNode = createGroupNode(groupId, groupTransform, {
        existingNodes: this.document.getAllNodes(),
        parentId: commonParentId
      });
      groupNode.boundingBox = {
        width: bounds.width,
        height: bounds.height
      };
      const allNodes = this.document.getAllNodes();
      let maxZIndex = -1;
      for (const nodeId of normalizedIds) {
        const index = allNodes.findIndex((n) => n.id === nodeId);
        if (index > maxZIndex) {
          maxZIndex = index;
        }
      }
      this.document.addNode(groupNode);
      if (maxZIndex >= 0) {
        this.document.setNodeZOrder(groupNode.id, maxZIndex);
      }
      const nodesByZOrder = nodes.map((node) => ({
        node,
        zIndex: allNodes.findIndex((n) => n.id === node.id)
      })).sort((a, b) => a.zIndex - b.zIndex);
      for (const { node } of nodesByZOrder) {
        this.document.reparent(node.id, groupId);
      }
      return groupId;
    }
    /**
     * Ungroup a group node, moving its children to the group's parent
     * Returns the IDs of the ungrouped children
     */
    ungroupNode(groupId) {
      const groupNode = this.document.getNode(groupId);
      if (!groupNode) {
        return null;
      }
      if (!isGroupNode(groupNode)) {
        return null;
      }
      if (groupNode.children.length === 0) {
        return null;
      }
      const parentId = groupNode.parentId;
      const childIds = [...groupNode.children];
      for (const childId of childIds) {
        const child = this.document.getNode(childId);
        if (!child) continue;
        this.document.reparent(childId, parentId);
      }
      this.document.removeNode(groupId);
      return childIds;
    }
    /**
     * Check if a node can be ungrouped
     */
    canUngroup(nodeId) {
      const node = this.document.getNode(nodeId);
      return node !== void 0 && isGroupNode(node) && node.children.length > 0;
    }
    /**
     * Check if multiple nodes can be grouped
     */
    canGroup(nodeIds) {
      const normalizedIds = this.normalizeSelectionForGrouping(nodeIds);
      if (!this.hasEnoughNodesToGroup(normalizedIds)) return false;
      for (const id of normalizedIds) {
        if (!this.document.getNode(id)) return false;
      }
      return this.getGroupingParentId(normalizedIds) !== null;
    }
    /** Need 2+ nodes, or a single shape/group (wrap it in a new parent group). */
    hasEnoughNodesToGroup(normalizedIds) {
      if (normalizedIds.length >= 2) return true;
      if (normalizedIds.length !== 1) return false;
      const node = this.document.getNode(normalizedIds[0]);
      if (!node) return false;
      return isGroupNode(node) || isShapeNode(node);
    }
    /**
     * Keep only top-level selected nodes: drop descendants of another selected node,
     * and replace a full leaf selection of a group with the group node itself.
     */
    normalizeSelectionForGrouping(nodeIds) {
      const uniqueIds = [...new Set(nodeIds)];
      const withoutDescendants = uniqueIds.filter(
        (id) => !uniqueIds.some(
          (otherId) => otherId !== id && this.isDescendantOf(id, otherId)
        )
      );
      const collapsed = this.collapseFullySelectedGroups(withoutDescendants);
      return collapsed.filter(
        (id) => !collapsed.some(
          (otherId) => otherId !== id && this.isDescendantOf(id, otherId)
        )
      );
    }
    /**
     * When every shape in a group is selected (but the group node is not), treat the group as selected.
     */
    collapseFullySelectedGroups(nodeIds) {
      const set = new Set(nodeIds);
      const toRemove = /* @__PURE__ */ new Set();
      const toAdd = /* @__PURE__ */ new Set();
      for (const node of this.document.getAllNodes()) {
        if (!isGroupNode(node)) continue;
        const leafShapeIds = this.getLeafShapeIds(node.id);
        if (leafShapeIds.length === 0) continue;
        const allLeavesSelected = leafShapeIds.every((id) => set.has(id));
        if (allLeavesSelected && !set.has(node.id)) {
          toAdd.add(node.id);
          for (const id of leafShapeIds) {
            toRemove.add(id);
          }
        }
      }
      const result = [...set].filter((id) => !toRemove.has(id));
      for (const id of toAdd) {
        result.push(id);
      }
      return result;
    }
    getLeafShapeIds(nodeId) {
      const node = this.document.getNode(nodeId);
      if (!node) return [];
      if (isGroupNode(node)) {
        return node.children.flatMap((childId) => this.getLeafShapeIds(childId));
      }
      return this.document.getShape(nodeId) ? [nodeId] : [];
    }
    isDescendantOf(nodeId, ancestorId) {
      let current = this.document.getNode(nodeId);
      while (current == null ? void 0 : current.parentId) {
        if (current.parentId === ancestorId) return true;
        current = this.document.getNode(current.parentId);
      }
      return false;
    }
    /**
     * Parent for the new group node. Uses the LCA of the top-level selection so
     * existing groups stay intact as single children (not flattened).
     */
    getGroupingParentId(normalizedIds) {
      const lca = this.findLCA(normalizedIds);
      if (lca === "root") {
        return void 0;
      }
      const lcaNode = this.document.getNode(lca);
      if (!lcaNode) return null;
      const lcaIsBeingGrouped = normalizedIds.includes(lca);
      if (isGroupNode(lcaNode) && !lcaIsBeingGrouped) {
        return lca;
      }
      return lcaNode.parentId;
    }
    getPathToRoot(nodeId) {
      var _a;
      const path = ["root"];
      let currentId = nodeId;
      while (currentId) {
        path.push(currentId);
        currentId = (_a = this.document.getNode(currentId)) == null ? void 0 : _a.parentId;
      }
      return path;
    }
    findLCA(nodeIds) {
      const paths = nodeIds.map((id) => this.getPathToRoot(id));
      let lca = "root";
      for (let i = 0; i < paths[0].length; i++) {
        const segment = paths[0][i];
        if (paths.every((p) => p[i] === segment)) {
          lca = segment;
        } else {
          break;
        }
      }
      return lca;
    }
    /**
     * Calculate bounding box for multiple nodes
     * Returns { x, y, width, height } or null if no valid bounds
     */
    calculateBoundingBox(nodeIds) {
      const aabbs = [];
      for (const nodeId of nodeIds) {
        this.collectNodeAABBs(nodeId, aabbs);
      }
      if (aabbs.length === 0) return null;
      const union = BoundingBoxService.unionAABBs(aabbs);
      return {
        x: union.minX,
        y: union.minY,
        width: union.maxX - union.minX,
        height: union.maxY - union.minY
      };
    }
    collectNodeAABBs(nodeId, aabbs) {
      const node = this.document.getNode(nodeId);
      if (!node) return;
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.collectNodeAABBs(childId, aabbs);
        }
        return;
      }
      const shape = this.document.getShape(nodeId);
      if (shape) {
        aabbs.push(BoundingBoxService.getAABB(node, shape));
      }
    }
  };

  // editor-engine/core/spatial/SpatialGrid.ts
  var SpatialGrid = class {
    constructor(config, getBounds) {
      this.cells = /* @__PURE__ */ new Map();
      this.nodeToKeys = /* @__PURE__ */ new Map();
      // Track grid bounds for dynamic expansion
      this.minX = 0;
      this.minY = 0;
      this.maxX = 0;
      this.maxY = 0;
      this.cellSize = config.cellSize;
      this.getBounds = getBounds;
      if (config.initialBounds) {
        this.minX = config.initialBounds.minX;
        this.minY = config.initialBounds.minY;
        this.maxX = config.initialBounds.maxX;
        this.maxY = config.initialBounds.maxY;
      }
    }
    /**
     * Generate a unique key for a grid cell
     */
    getCellKey(cellX, cellY) {
      return `${cellX},${cellY}`;
    }
    /**
     * Convert world coordinates to grid cell coordinates
     */
    worldToCell(x, y) {
      return {
        cellX: Math.floor(x / this.cellSize),
        cellY: Math.floor(y / this.cellSize)
      };
    }
    /**
     * Get or create a cell at the given grid coordinates
     */
    getOrCreateCell(cellX, cellY) {
      const key = this.getCellKey(cellX, cellY);
      let cell = this.cells.get(key);
      if (!cell) {
        cell = { nodeIds: /* @__PURE__ */ new Set() };
        this.cells.set(key, cell);
      }
      return cell;
    }
    /**
     * Get all grid cells that overlap with the given AABB
     */
    getCellsForAABB(aabb) {
      const minCell = this.worldToCell(aabb.minX, aabb.minY);
      const maxCell = this.worldToCell(aabb.maxX, aabb.maxY);
      const cells = [];
      for (let x = minCell.cellX; x <= maxCell.cellX; x++) {
        for (let y = minCell.cellY; y <= maxCell.cellY; y++) {
          cells.push({ cellX: x, cellY: y });
        }
      }
      return cells;
    }
    /**
     * Insert a node into the spatial grid
     * The node will be added to all cells its bounding box overlaps
     */
    insert(nodeId) {
      const aabb = this.getBounds(nodeId);
      if (!aabb) {
        return;
      }
      this.minX = Math.min(this.minX, aabb.minX);
      this.minY = Math.min(this.minY, aabb.minY);
      this.maxX = Math.max(this.maxX, aabb.maxX);
      this.maxY = Math.max(this.maxY, aabb.maxY);
      const cells = this.getCellsForAABB(aabb);
      const cellKeys = /* @__PURE__ */ new Set();
      for (const { cellX, cellY } of cells) {
        const cell = this.getOrCreateCell(cellX, cellY);
        cell.nodeIds.add(nodeId);
        cellKeys.add(this.getCellKey(cellX, cellY));
      }
      this.nodeToKeys.set(nodeId, cellKeys);
    }
    /**
     * Remove a node from the spatial grid
     */
    remove(nodeId) {
      const cellKeys = this.nodeToKeys.get(nodeId);
      if (!cellKeys) {
        return;
      }
      for (const key of cellKeys) {
        const cell = this.cells.get(key);
        if (cell) {
          cell.nodeIds.delete(nodeId);
          if (cell.nodeIds.size === 0) {
            this.cells.delete(key);
          }
        }
      }
      this.nodeToKeys.delete(nodeId);
    }
    /**
     * Update a node's position in the grid
     * More efficient than remove + insert as it only updates changed cells
     */
    update(nodeId) {
      this.remove(nodeId);
      this.insert(nodeId);
    }
    /**
     * Query all nodes at a specific point in world space
     * Returns nodes whose bounding boxes contain the point
     */
    queryPoint(x, y) {
      const { cellX, cellY } = this.worldToCell(x, y);
      const cell = this.cells.get(this.getCellKey(cellX, cellY));
      if (!cell) {
        return [];
      }
      const results = [];
      for (const nodeId of cell.nodeIds) {
        const aabb = this.getBounds(nodeId);
        if (!aabb) continue;
        if (x >= aabb.minX && x <= aabb.maxX && y >= aabb.minY && y <= aabb.maxY) {
          results.push({ nodeId, bounds: aabb });
        }
      }
      return results;
    }
    /**
     * Query all nodes that overlap with a rectangular region
     * Returns nodes whose bounding boxes intersect the query region
     */
    queryRegion(minX, minY, maxX, maxY) {
      const queryAABB = { minX, minY, maxX, maxY };
      const cells = this.getCellsForAABB(queryAABB);
      const candidateNodeIds = /* @__PURE__ */ new Set();
      for (const { cellX, cellY } of cells) {
        const cell = this.cells.get(this.getCellKey(cellX, cellY));
        if (cell) {
          for (const nodeId of cell.nodeIds) {
            candidateNodeIds.add(nodeId);
          }
        }
      }
      const results = [];
      for (const nodeId of candidateNodeIds) {
        const aabb = this.getBounds(nodeId);
        if (!aabb) continue;
        if (this.aabbIntersects(aabb, queryAABB)) {
          results.push({ nodeId, bounds: aabb });
        }
      }
      return results;
    }
    /**
     * Query all nodes within a circular region
     */
    queryCircle(centerX, centerY, radius) {
      const queryAABB = {
        minX: centerX - radius,
        minY: centerY - radius,
        maxX: centerX + radius,
        maxY: centerY + radius
      };
      const cells = this.getCellsForAABB(queryAABB);
      const candidateNodeIds = /* @__PURE__ */ new Set();
      for (const { cellX, cellY } of cells) {
        const cell = this.cells.get(this.getCellKey(cellX, cellY));
        if (cell) {
          for (const nodeId of cell.nodeIds) {
            candidateNodeIds.add(nodeId);
          }
        }
      }
      const results = [];
      const radiusSquared = radius * radius;
      for (const nodeId of candidateNodeIds) {
        const aabb = this.getBounds(nodeId);
        if (!aabb) continue;
        const closestX = Math.max(aabb.minX, Math.min(centerX, aabb.maxX));
        const closestY = Math.max(aabb.minY, Math.min(centerY, aabb.maxY));
        const dx = closestX - centerX;
        const dy = closestY - centerY;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared <= radiusSquared) {
          results.push({ nodeId, bounds: aabb });
        }
      }
      return results;
    }
    /**
     * Get all nodes in the grid
     */
    getAllNodes() {
      const results = [];
      const processedIds = /* @__PURE__ */ new Set();
      for (const cell of this.cells.values()) {
        for (const nodeId of cell.nodeIds) {
          if (processedIds.has(nodeId)) continue;
          processedIds.add(nodeId);
          const aabb = this.getBounds(nodeId);
          if (aabb) {
            results.push({ nodeId, bounds: aabb });
          }
        }
      }
      return results;
    }
    /**
     * Check if a node exists in the grid
     */
    has(nodeId) {
      return this.nodeToKeys.has(nodeId);
    }
    /**
     * Get the number of nodes in the grid
     */
    size() {
      return this.nodeToKeys.size;
    }
    /**
     * Clear all nodes from the grid
     */
    clear() {
      this.cells.clear();
      this.nodeToKeys.clear();
    }
    /**
     * Check if two AABBs intersect
     */
    aabbIntersects(a, b) {
      return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
    }
    /**
     * Get statistics about the grid
     */
    getStats() {
      let totalNodes = 0;
      for (const cell of this.cells.values()) {
        totalNodes += cell.nodeIds.size;
      }
      return {
        cellCount: this.cells.size,
        nodeCount: this.nodeToKeys.size,
        averageNodesPerCell: this.cells.size > 0 ? totalNodes / this.cells.size : 0,
        cellSize: this.cellSize,
        bounds: {
          minX: this.minX,
          minY: this.minY,
          maxX: this.maxX,
          maxY: this.maxY
        }
      };
    }
    /**
     * Rebuild the entire grid from a collection of node IDs
     * Useful after bulk operations or when grid becomes fragmented
     */
    rebuild(nodeIds) {
      this.clear();
      for (const nodeId of nodeIds) {
        this.insert(nodeId);
      }
    }
    /**
     * Get the cell size
     */
    getCellSize() {
      return this.cellSize;
    }
    /**
     * Update the cell size and rebuild the grid
     * Warning: This is an expensive operation
     */
    setCellSize(cellSize, nodeIds) {
      this.cellSize = cellSize;
      this.rebuild(nodeIds);
    }
  };

  // editor-engine/core/services/SpatialIndexService.ts
  var SpatialIndexService = class {
    constructor(document, events) {
      this.document = document;
      this.events = events;
      this.autoSync = true;
      this.unsubscribers = [];
    }
    /**
     * Check if spatial indexing is enabled
     */
    isEnabled() {
      return this.grid !== void 0;
    }
    /**
     * Enable spatial indexing with the given configuration
     * If already enabled, this will rebuild the index with new settings
     */
    enable(config = {}) {
      var _a, _b, _c;
      const cellSize = (_a = config.cellSize) != null ? _a : 100;
      this.autoSync = (_b = config.autoSync) != null ? _b : true;
      const getBounds = (nodeId) => {
        const node = this.document.getNode(nodeId);
        const shape = this.document.getShape(nodeId);
        if (!node || !shape || !isShapeNode(node)) {
          return null;
        }
        return BoundingBoxService.getAABB(node, shape);
      };
      const gridConfig = {
        cellSize,
        initialBounds: config.initialBounds
      };
      this.grid = new SpatialGrid(gridConfig, getBounds);
      this.rebuild();
      if (this.autoSync && this.events) {
        this.setupAutoSync();
      }
      (_c = this.events) == null ? void 0 : _c.emit("spatialIndex:enabled", { cellSize });
    }
    /**
     * Disable spatial indexing and clean up resources
     */
    disable() {
      var _a;
      if (!this.grid) return;
      this.unsubscribers.forEach((unsub) => unsub());
      this.unsubscribers = [];
      this.grid.clear();
      this.grid = void 0;
      (_a = this.events) == null ? void 0 : _a.emit("spatialIndex:disabled");
    }
    /**
     * Rebuild the entire spatial index from current document state
     * Useful after bulk operations or when index becomes stale
     */
    rebuild() {
      var _a;
      if (!this.grid) return;
      const nodeIds = [];
      for (const node of this.document.getAllNodes()) {
        if (isShapeNode(node)) {
          nodeIds.push(node.id);
        }
      }
      this.grid.rebuild(nodeIds);
      (_a = this.events) == null ? void 0 : _a.emit("spatialIndex:rebuilt", { nodeCount: nodeIds.length });
    }
    /**
     * Manually update a node in the spatial index
     * Only needed if autoSync is disabled
     */
    updateNode(nodeId) {
      if (!this.grid) return;
      this.grid.update(nodeId);
    }
    /**
     * Manually insert a node into the spatial index
     * Only needed if autoSync is disabled
     */
    insertNode(nodeId) {
      if (!this.grid) return;
      this.grid.insert(nodeId);
    }
    /**
     * Manually remove a node from the spatial index
     * Only needed if autoSync is disabled
     */
    removeNode(nodeId) {
      if (!this.grid) return;
      this.grid.remove(nodeId);
    }
    /**
     * Query all shape nodes at a specific point in world space
     * Returns empty array if spatial indexing is disabled
     */
    queryPoint(x, y) {
      if (!this.grid) return [];
      const results = this.grid.queryPoint(x, y);
      const nodes = [];
      for (const { nodeId } of results) {
        const node = this.document.getNode(nodeId);
        if (node && isShapeNode(node)) {
          nodes.push(node);
        }
      }
      return nodes;
    }
    /**
     * Query all shape nodes in a rectangular region
     * Returns empty array if spatial indexing is disabled
     */
    queryRegion(minX, minY, maxX, maxY) {
      if (!this.grid) return [];
      const results = this.grid.queryRegion(minX, minY, maxX, maxY);
      const nodes = [];
      for (const { nodeId } of results) {
        const node = this.document.getNode(nodeId);
        if (node && isShapeNode(node)) {
          nodes.push(node);
        }
      }
      return nodes;
    }
    /**
     * Query all shape nodes within a circular region
     * Returns empty array if spatial indexing is disabled
     */
    queryCircle(centerX, centerY, radius) {
      if (!this.grid) return [];
      const results = this.grid.queryCircle(centerX, centerY, radius);
      const nodes = [];
      for (const { nodeId } of results) {
        const node = this.document.getNode(nodeId);
        if (node && isShapeNode(node)) {
          nodes.push(node);
        }
      }
      return nodes;
    }
    /**
     * Query all shape nodes with their bounding boxes at a point
     * Useful when you need both the node and its bounds
     */
    queryPointWithBounds(x, y) {
      if (!this.grid) return [];
      const results = this.grid.queryPoint(x, y);
      const output = [];
      for (const { nodeId, bounds } of results) {
        const node = this.document.getNode(nodeId);
        if (node && isShapeNode(node)) {
          output.push({ node, bounds });
        }
      }
      return output;
    }
    /**
     * Get statistics about the spatial index
     * Returns null if spatial indexing is disabled
     */
    getStats() {
      if (!this.grid) return null;
      return this.grid.getStats();
    }
    /**
     * Change the cell size and rebuild the index
     * Warning: This is an expensive operation
     */
    setCellSize(cellSize) {
      var _a;
      if (!this.grid) return;
      const nodeIds = [];
      for (const node of this.document.getAllNodes()) {
        if (isShapeNode(node)) {
          nodeIds.push(node.id);
        }
      }
      this.grid.setCellSize(cellSize, nodeIds);
      (_a = this.events) == null ? void 0 : _a.emit("spatialIndex:cellSizeChanged", { cellSize });
    }
    /**
     * Set up automatic synchronization with document changes
     * This listens to document events and updates the spatial index accordingly
     */
    setupAutoSync() {
      if (!this.events) return;
      const unsubAdd = this.events.on("document:nodeAdded", (data) => {
        const eventData = data;
        if ((eventData == null ? void 0 : eventData.nodeId) && this.grid) {
          const node = this.document.getNode(eventData.nodeId);
          if (node && isShapeNode(node)) {
            this.grid.insert(eventData.nodeId);
          }
        }
      });
      const unsubRemove = this.events.on(
        "document:nodeRemoved",
        (data) => {
          const eventData = data;
          if ((eventData == null ? void 0 : eventData.nodeId) && this.grid) {
            this.grid.remove(eventData.nodeId);
          }
        }
      );
      const unsubUpdate = this.events.on(
        "document:nodeUpdated",
        (data) => {
          const eventData = data;
          if ((eventData == null ? void 0 : eventData.nodeId) && this.grid) {
            const node = this.document.getNode(eventData.nodeId);
            if (node && isShapeNode(node)) {
              this.grid.update(eventData.nodeId);
            }
          }
        }
      );
      const unsubShapeUpdate = this.events.on(
        "document:shapeUpdated",
        (data) => {
          const eventData = data;
          if ((eventData == null ? void 0 : eventData.nodeId) && this.grid) {
            this.grid.update(eventData.nodeId);
          }
        }
      );
      const unsubClear = this.events.on("document:cleared", () => {
        if (this.grid) {
          this.grid.clear();
        }
      });
      this.unsubscribers.push(
        unsubAdd,
        unsubRemove,
        unsubUpdate,
        unsubShapeUpdate,
        unsubClear
      );
    }
  };

  // editor-engine/core/services/ShapeQueryService.ts
  var ShapeQueryService = class {
    constructor(document, spatialIndex) {
      this.document = document;
      this.spatialIndex = spatialIndex;
    }
    /**
     * Find the first shape at a given point using hit testing
     * @param x - X coordinate in world space
     * @param y - Y coordinate in world space
     * @param hitTestAdapter - Hit test adapter for precise shape testing
     * @param priorityNodeId - Optional node ID to check first (optimization for hover tracking)
     * @returns The shape node at the point, or undefined if none found
     */
    findShapeAtPoint(x, y, hitTestAdapter, priorityNodeId) {
      if (!hitTestAdapter) {
        return void 0;
      }
      if (this.spatialIndex.isEnabled()) {
        const candidates = this.spatialIndex.queryPoint(x, y);
        for (let i = candidates.length - 1; i >= 0; i--) {
          const candidate = candidates[i];
          const shape = this.document.getShape(candidate.id);
          if (shape && hitTestAdapter.testShape(candidate, shape, x, y)) {
            return candidate;
          }
        }
        return void 0;
      }
      const shapeNodes = this.document.getShapeNodes();
      for (let i = shapeNodes.length - 1; i >= 0; i--) {
        const [node, shape] = shapeNodes[i];
        if (isShapeNode(node) && hitTestAdapter.testShape(node, shape, x, y)) {
          return node;
        }
      }
      return void 0;
    }
    /**
     * Find all shapes that intersect with a rectangular region
     * @param minX - Minimum X coordinate
     * @param minY - Minimum Y coordinate
     * @param maxX - Maximum X coordinate
     * @param maxY - Maximum Y coordinate
     * @returns Array of shape nodes that intersect the region
     */
    findShapesInRegion(minX, minY, maxX, maxY) {
      const marquee = { minX, minY, maxX, maxY };
      const results = [];
      if (this.spatialIndex.isEnabled()) {
        const candidates = this.spatialIndex.queryRegion(minX, minY, maxX, maxY);
        for (const candidate of candidates) {
          const shape = this.document.getShape(candidate.id);
          if (!shape) continue;
          const intersects = shape.type === "LINE" ? BoundingBoxService.lineIntersectsAABB(
            candidate.transform.x + shape.geometry.x1,
            candidate.transform.y + shape.geometry.y1,
            candidate.transform.x + shape.geometry.x2,
            candidate.transform.y + shape.geometry.y2,
            marquee
          ) : BoundingBoxService.aabbIntersects(
            marquee,
            BoundingBoxService.getAABB(candidate, shape)
          );
          if (intersects) {
            results.push(candidate);
          }
        }
        return results;
      }
      const shapeNodes = this.document.getShapeNodes();
      for (const [node, shape] of shapeNodes) {
        if (!isShapeNode(node)) continue;
        const intersects = shape.type === "LINE" ? BoundingBoxService.lineIntersectsAABB(
          node.transform.x + shape.geometry.x1,
          node.transform.y + shape.geometry.y1,
          node.transform.x + shape.geometry.x2,
          node.transform.y + shape.geometry.y2,
          marquee
        ) : BoundingBoxService.aabbIntersects(
          marquee,
          BoundingBoxService.getAABB(node, shape)
        );
        if (intersects) {
          results.push(node);
        }
      }
      return results;
    }
    /**
     * Find all shapes within a circular region
     * @param centerX - Center X coordinate
     * @param centerY - Center Y coordinate
     * @param radius - Radius of the circle
     * @returns Array of shape nodes within the circle
     */
    findShapesInCircle(centerX, centerY, radius) {
      if (this.spatialIndex.isEnabled()) {
        return this.spatialIndex.queryCircle(centerX, centerY, radius);
      }
      const results = [];
      const shapeNodes = this.document.getShapeNodes();
      const radiusSquared = radius * radius;
      for (const [node, shape] of shapeNodes) {
        if (!isShapeNode(node)) continue;
        const aabb = BoundingBoxService.getAABB(node, shape);
        const closestX = Math.max(aabb.minX, Math.min(centerX, aabb.maxX));
        const closestY = Math.max(aabb.minY, Math.min(centerY, aabb.maxY));
        const distanceSquared = (closestX - centerX) ** 2 + (closestY - centerY) ** 2;
        if (distanceSquared <= radiusSquared) {
          results.push(node);
        }
      }
      return results;
    }
    /**
     * Check if spatial indexing is currently enabled
     */
    isSpatialIndexEnabled() {
      return this.spatialIndex.isEnabled();
    }
    /**
     * Get statistics about the current query strategy
     */
    getQueryStats() {
      const totalShapes = this.document.getShapeNodes().length;
      const usingSpatialIndex = this.spatialIndex.isEnabled();
      return {
        usingSpatialIndex,
        totalShapes,
        spatialIndexStats: usingSpatialIndex ? this.spatialIndex.getStats() : void 0
      };
    }
  };

  // editor-engine/core/EventBus.ts
  var EventBus = class {
    constructor() {
      this.listeners = /* @__PURE__ */ new Map();
    }
    /**
     * Subscribe to an event
     * @param event - Event name to listen for
     * @param callback - Function to call when event is emitted
     * @returns Unsubscribe function
     */
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, /* @__PURE__ */ new Set());
      }
      this.listeners.get(event).add(callback);
      return () => this.off(event, callback);
    }
    /**
     * Subscribe to an event that fires only once
     * @param event - Event name to listen for
     * @param callback - Function to call when event is emitted
     */
    once(event, callback) {
      const unsubscribe = this.on(event, (data) => {
        unsubscribe();
        callback(data);
      });
    }
    /**
     * Emit an event to all subscribers
     * @param event - Event name to emit
     * @param data - Data to pass to subscribers
     */
    emit(event, data) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event listener for "${event}":`, error);
          }
        });
      }
      const wildcardCallbacks = this.listeners.get("*");
      if (wildcardCallbacks) {
        wildcardCallbacks.forEach((callback) => {
          try {
            callback({ event, data });
          } catch (error) {
            console.error(`Error in wildcard event listener:`, error);
          }
        });
      }
    }
    /**
     * Unsubscribe from an event
     * @param event - Event name
     * @param callback - Callback to remove
     */
    off(event, callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
    /**
     * Remove all listeners for an event, or all events if no event specified
     * @param event - Optional event name to clear
     */
    clear(event) {
      if (event) {
        this.listeners.delete(event);
      } else {
        this.listeners.clear();
      }
    }
    /**
     * Get count of listeners for an event
     * @param event - Event name
     * @returns Number of listeners
     */
    listenerCount(event) {
      var _a;
      return ((_a = this.listeners.get(event)) == null ? void 0 : _a.size) || 0;
    }
  };

  // editor-engine/core/commands/CommandManager.ts
  var CommandManager = class {
    constructor(eventBus) {
      this.eventBus = eventBus;
      this.history = [];
      this.currentIndex = -1;
      this.maxHistorySize = 100;
    }
    /**
     * Execute a command and add it to history
     * @param command - Command to execute
     */
    execute(command) {
      if (!command.canExecute()) {
        console.warn("Command cannot be executed:", command.describe());
        return;
      }
      try {
        command.execute();
        if (command.isUndoable()) {
          this.history = this.history.slice(0, this.currentIndex + 1);
          this.history.push(command);
          this.currentIndex++;
          if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
          }
        }
        this.eventBus.emit("command:executed", {
          command: command.describe(),
          canUndo: this.canUndo(),
          canRedo: this.canRedo()
        });
      } catch (error) {
        console.error("Error executing command:", command.describe(), error);
        this.eventBus.emit("command:error", {
          command: command.describe(),
          error
        });
      }
    }
    /**
     * Undo the last command
     * @returns true if undo was successful
     */
    undo() {
      if (!this.canUndo()) {
        return false;
      }
      try {
        const command = this.history[this.currentIndex];
        if (!command.canUndo()) {
          console.warn("Command cannot be undone:", command.describe());
          return false;
        }
        command.undo();
        this.currentIndex--;
        this.eventBus.emit("command:undone", {
          command: command.describe(),
          canUndo: this.canUndo(),
          canRedo: this.canRedo()
        });
        return true;
      } catch (error) {
        console.error("Error undoing command:", error);
        this.eventBus.emit("command:error", { error });
        return false;
      }
    }
    /**
     * Redo the next command
     * @returns true if redo was successful
     */
    redo() {
      if (!this.canRedo()) {
        return false;
      }
      try {
        this.currentIndex++;
        const command = this.history[this.currentIndex];
        command.execute();
        this.eventBus.emit("command:redone", {
          command: command.describe(),
          canUndo: this.canUndo(),
          canRedo: this.canRedo()
        });
        return true;
      } catch (error) {
        console.error("Error redoing command:", error);
        this.currentIndex--;
        this.eventBus.emit("command:error", { error });
        return false;
      }
    }
    /**
     * Check if undo is available
     */
    canUndo() {
      return this.currentIndex >= 0;
    }
    /**
     * Check if redo is available
     */
    canRedo() {
      return this.currentIndex < this.history.length - 1;
    }
    /**
     * Clear command history
     */
    clear() {
      this.history = [];
      this.currentIndex = -1;
      this.eventBus.emit("command:history:cleared");
    }
    /**
     * Get command history for debugging
     */
    getHistory() {
      return this.history.map((cmd) => cmd.describe());
    }
    /**
     * Get current position in history
     */
    getCurrentIndex() {
      return this.currentIndex;
    }
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size) {
      this.maxHistorySize = Math.max(1, size);
    }
  };

  // editor-engine/core/commands/Command.ts
  var Command = class {
    /**
     * Optional: Check if the command can be executed
     * @returns true if command can be executed
     */
    canExecute() {
      return true;
    }
    /**
     * Optional: Check if the command can be undone
     * @returns true if command can be undone
     */
    canUndo() {
      return true;
    }
    /**
     * Optional: Check if the command should be added to undo/redo history
     * @returns true if command should be stored in history (default: true)
     */
    isUndoable() {
      return true;
    }
  };

  // editor-engine/core/commands/SetToolCommand.ts
  var SetToolCommand = class extends Command {
    constructor(editor, newToolId) {
      var _a;
      super();
      this.editor = editor;
      this.newToolId = newToolId;
      this.oldToolId = ((_a = editor.tools.getActive()) == null ? void 0 : _a.id) || "";
    }
    execute() {
      this.editor.tools.setActive(this.newToolId);
      this.editor.events.emit("tool:changed", { toolId: this.newToolId });
    }
    undo() {
      if (this.oldToolId) {
        this.editor.tools.setActive(this.oldToolId);
        this.editor.events.emit("tool:changed", { toolId: this.oldToolId });
      }
    }
    describe() {
      return `Set tool to ${this.newToolId}`;
    }
    canUndo() {
      return !!this.oldToolId;
    }
    isUndoable() {
      return false;
    }
  };

  // editor-engine/core/commands/UpdateToolOptionsCommand.ts
  var UpdateToolOptionsCommand = class extends Command {
    constructor(editor, newOptions) {
      super();
      this.editor = editor;
      this.newOptions = newOptions;
      this.oldOptions = {};
      Object.keys(newOptions).forEach((key) => {
        const optionKey = key;
        this.oldOptions[optionKey] = this.editor.state.toolOptions[optionKey];
      });
    }
    execute() {
      this.editor.state.updateToolOptions(this.newOptions);
      this.editor.events.emit("tool:options:changed", {
        options: this.newOptions
      });
    }
    undo() {
      this.editor.state.updateToolOptions(this.oldOptions);
      this.editor.events.emit("tool:options:changed", {
        options: this.oldOptions
      });
    }
    describe() {
      const changes = Object.entries(this.newOptions).map(([key, value]) => `${key}=${value}`).join(", ");
      return `Update tool options: ${changes}`;
    }
    isUndoable() {
      return false;
    }
  };

  // editor-engine/core/commands/ClearCommand.ts
  var ClearCommand = class extends Command {
    constructor(editor) {
      super();
      this.editor = editor;
      this.savedNodes = [];
      this.savedSelection = [];
    }
    execute() {
      var _a;
      this.savedNodes = [...this.editor.document.getAllNodes()];
      this.savedSelection = [...this.editor.selection.getAll()];
      this.editor.document.clear();
      this.editor.selection.clear();
      this.editor.state.clearTransient();
      (_a = this.editor.renderer) == null ? void 0 : _a.clear();
      this.editor.events.emit("document:cleared");
    }
    undo() {
      this.savedNodes.forEach((node) => {
        this.editor.document.addNode(node);
      });
      if (this.savedSelection.length > 0) {
        this.editor.selection.setMany(this.savedSelection);
      }
      this.editor.events.emit("document:restored", {
        nodeCount: this.savedNodes.length
      });
    }
    describe() {
      return `Clear document (${this.savedNodes.length} nodes)`;
    }
    canUndo() {
      return this.savedNodes.length > 0;
    }
  };

  // editor-engine/core/commands/GroupCommand.ts
  var GroupCommand = class extends Command {
    constructor(editor) {
      super();
      this.editor = editor;
      this.groupId = null;
      this.selectedIds = [];
      this.selectedIds = [...this.editor.selection.getAll()];
    }
    execute() {
      this.groupId = this.editor.groupService.groupNodes(this.selectedIds);
      if (this.groupId) {
        this.editor.selection.setSingle(this.groupId);
      }
      this.editor.events.emit("document:modified");
    }
    undo() {
      if (!this.groupId) return;
      const childIds = this.editor.groupService.ungroupNode(this.groupId);
      if (childIds) {
        this.editor.selection.setMany(this.selectedIds);
      }
      this.editor.events.emit("document:modified");
    }
    describe() {
      return `Group ${this.selectedIds.length} nodes`;
    }
    canExecute() {
      return this.editor.groupService.canGroup(this.selectedIds);
    }
    canUndo() {
      return this.groupId !== null;
    }
  };

  // editor-engine/core/commands/UngroupCommand.ts
  var UngroupCommand = class extends Command {
    constructor(editor) {
      super();
      this.editor = editor;
      this.ungroupedData = [];
      this.selectedIds = [];
      this.selectedIds = [...this.editor.selection.getAll()];
    }
    execute() {
      this.ungroupedData = [];
      for (const id of this.selectedIds) {
        if (this.editor.groupService.canUngroup(id)) {
          const childIds = this.editor.groupService.ungroupNode(id);
          if (childIds) {
            this.ungroupedData.push({ groupId: id, childIds });
          }
        }
      }
      if (this.ungroupedData.length > 0) {
        const allChildIds = this.ungroupedData.flatMap((data) => data.childIds);
        this.editor.selection.setMany(allChildIds);
      }
      this.editor.events.emit("document:modified");
    }
    undo() {
      if (this.ungroupedData.length === 0) return;
      const newGroupIds = [];
      for (const { childIds } of this.ungroupedData) {
        const groupId = this.editor.groupService.groupNodes(childIds);
        if (groupId) {
          newGroupIds.push(groupId);
        }
      }
      if (newGroupIds.length > 0) {
        this.editor.selection.setMany(newGroupIds);
      }
      this.editor.events.emit("document:modified");
    }
    describe() {
      return `Ungroup ${this.selectedIds.length} group(s)`;
    }
    canExecute() {
      return this.selectedIds.some(
        (id) => this.editor.groupService.canUngroup(id)
      );
    }
    canUndo() {
      return this.ungroupedData.length > 0;
    }
  };

  // editor-engine/core/commands/CreateShapeCommand.ts
  var CreateShapeCommand = class extends Command {
    constructor(editor, node, shape) {
      super();
      this.editor = editor;
      this.nodeId = node.id;
      this.node = node;
      this.shape = shape;
    }
    execute() {
      var _a;
      this.editor.document.addNode(this.node);
      this.editor.document.addShape(this.shape);
      this.editor.selection.setSingle(this.nodeId);
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    undo() {
      var _a;
      this.editor.document.removeNode(this.nodeId);
      if (this.editor.selection.isSelected(this.nodeId)) {
        this.editor.selection.clear();
      }
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    describe() {
      return `Create ${this.shape.type} shape`;
    }
    canUndo() {
      return true;
    }
  };

  // editor-engine/core/commands/UpdateShapesStyleCommand.ts
  var UpdateShapesStyleCommand = class extends Command {
    constructor(editor, nodeIds, newStyle) {
      super();
      this.editor = editor;
      this.nodeIds = nodeIds;
      this.newStyle = newStyle;
      this.oldStyles = /* @__PURE__ */ new Map();
      nodeIds.forEach((nodeId) => {
        const shape = editor.document.getShape(nodeId);
        if (shape) {
          this.oldStyles.set(nodeId, { ...shape.style });
        }
      });
    }
    execute() {
      var _a;
      this.nodeIds.forEach((nodeId) => {
        const shape = this.editor.document.getShape(nodeId);
        if (shape) {
          Object.assign(shape.style, this.newStyle);
          this.editor.document.updateShape(shape);
        }
      });
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    undo() {
      var _a;
      this.nodeIds.forEach((nodeId) => {
        const shape = this.editor.document.getShape(nodeId);
        const oldStyle = this.oldStyles.get(nodeId);
        if (shape && oldStyle) {
          shape.style = oldStyle;
          this.editor.document.updateShape(shape);
        }
      });
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    describe() {
      const styleChanges = Object.entries(this.newStyle).map(([key, value]) => `${key}=${value}`).join(", ");
      return `Update style of ${this.nodeIds.length} shape(s): ${styleChanges}`;
    }
    canUndo() {
      return true;
    }
  };

  // editor-engine/core/commands/DeleteShapesCommand.ts
  var DeleteShapesCommand = class extends Command {
    constructor(editor, nodeIds) {
      super();
      this.editor = editor;
      this.deletedItems = [];
      this.deletedIds = [...nodeIds];
    }
    execute() {
      var _a;
      this.deletedItems = [];
      this.deletedIds.forEach((id) => {
        const node = this.editor.document.getNode(id);
        const shape = this.editor.document.getShape(id);
        if (node) {
          this.deletedItems.push({
            node: JSON.parse(JSON.stringify(node)),
            shape: shape ? JSON.parse(JSON.stringify(shape)) : void 0
          });
          this.editor.document.removeNode(id);
        }
      });
      this.editor.selection.clear();
      this.editor.state.clearTransient();
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    undo() {
      var _a;
      this.deletedItems.forEach(({ node, shape }) => {
        this.editor.document.addNode(node);
        if (shape) {
          this.editor.document.addShape(shape);
        }
      });
      this.editor.selection.setMany(this.deletedIds);
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    describe() {
      return `Delete ${this.deletedIds.length} shape(s)`;
    }
    canExecute() {
      return this.deletedIds.length > 0;
    }
    canUndo() {
      return this.deletedItems.length > 0;
    }
  };

  // editor-engine/core/commands/TransformShapesCommand.ts
  var TransformShapesCommand = class extends Command {
    constructor(editor, transforms, operationType = "move") {
      super();
      this.editor = editor;
      this.transforms = [];
      this.operationType = operationType;
      transforms.forEach(({ nodeId, newNode, newShape }) => {
        const oldNode = editor.document.getNode(nodeId);
        const oldShape = editor.document.getShape(nodeId);
        if (oldNode) {
          this.transforms.push({
            nodeId,
            oldNode: JSON.parse(JSON.stringify(oldNode)),
            oldShape: oldShape ? JSON.parse(JSON.stringify(oldShape)) : void 0,
            newNode,
            newShape
          });
        }
      });
    }
    execute() {
      var _a;
      this.transforms.forEach(({ nodeId, newNode, newShape }) => {
        this.editor.document.updateNode(newNode);
        if (newShape) {
          this.editor.document.updateShape(newShape);
        }
      });
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    undo() {
      var _a;
      this.transforms.forEach(({ nodeId, oldNode, oldShape }) => {
        this.editor.document.updateNode(oldNode);
        if (oldShape) {
          this.editor.document.updateShape(oldShape);
        }
      });
      (_a = this.editor.renderer) == null ? void 0 : _a.renderShapes();
      this.editor.events.emit("document:modified");
    }
    describe() {
      const count = this.transforms.length;
      return `${this.operationType.charAt(0).toUpperCase() + this.operationType.slice(1)} ${count} shape(s)`;
    }
    canExecute() {
      return this.transforms.length > 0;
    }
    canUndo() {
      return this.transforms.length > 0;
    }
  };

  // editor-engine/core/KeyboardShortcutManager.ts
  var KeyboardShortcutManager = class {
    constructor() {
      this.toolMap = {
        v: "select",
        r: "rectangle",
        o: "ellipse",
        l: "line"
      };
    }
    /**
     * Check if the event is a grouping shortcut (Cmd/Ctrl+G)
     */
    isGroupShortcut(e) {
      return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g" && !e.shiftKey;
    }
    /**
     * Check if the event is an ungrouping shortcut (Cmd/Ctrl+Shift+G)
     */
    isUngroupShortcut(e) {
      return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g" && e.shiftKey;
    }
    /**
     * Get the tool ID for a keyboard shortcut
     * Returns null if no tool is mapped to the key
     */
    getToolForKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return null;
      }
      const key = e.key.toLowerCase();
      return this.toolMap[key] || null;
    }
    /**
     * Register a custom tool shortcut
     */
    registerToolShortcut(key, toolId) {
      this.toolMap[key.toLowerCase()] = toolId;
    }
    /**
     * Unregister a tool shortcut
     */
    unregisterToolShortcut(key) {
      delete this.toolMap[key.toLowerCase()];
    }
    /**
     * Get all registered tool shortcuts
     */
    getToolShortcuts() {
      return { ...this.toolMap };
    }
  };

  // editor-engine/core/InputManager.ts
  var InputManager = class {
    constructor(editor) {
      this.editor = editor;
      this.shortcuts = new KeyboardShortcutManager();
    }
    /**
     * Get the keyboard shortcut manager
     */
    getShortcutManager() {
      return this.shortcuts;
    }
    /**
     * Handle pointer down events
     */
    handlePointerDown(e) {
      this.editor.tools.pointerDown(e);
    }
    /**
     * Handle pointer move events
     */
    handlePointerMove(e) {
      this.editor.tools.pointerMove(e);
    }
    /**
     * Handle pointer up events
     */
    handlePointerUp(e) {
      this.editor.tools.pointerUp(e);
    }
    /**
     * Handle keyboard down events
     */
    handleKeyDown(e) {
      var _a, _b;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        this.editor.commands.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        this.editor.commands.redo();
        return;
      }
      if (this.shortcuts.isGroupShortcut(e)) {
        e.preventDefault();
        this.editor.commands.execute(new GroupCommand(this.editor));
        return;
      }
      if (this.shortcuts.isUngroupShortcut(e)) {
        e.preventDefault();
        this.editor.commands.execute(new UngroupCommand(this.editor));
        return;
      }
      const toolId = this.shortcuts.getToolForKey(e);
      if (toolId && ((_a = this.editor.tools.getActive()) == null ? void 0 : _a.id) !== toolId) {
        e.preventDefault();
        this.editor.setActiveTool(toolId);
        this.editor.selection.clear();
        this.editor.state.clearTransient();
        (_b = this.editor.renderer) == null ? void 0 : _b.clearSelectionBox();
        return;
      }
      this.editor.tools.keyDown(e);
    }
    /**
     * Handle keyboard up events
     */
    handleKeyUp(e) {
      this.editor.tools.keyUp(e);
    }
  };

  // editor-engine/core/Editor.ts
  var Editor = class {
    constructor() {
      this.document = new Document();
      this.selection = new SelectionManager();
      this.tools = new ToolManager(this);
      this.state = new EditorState();
      this.events = new EventBus();
      this.groupService = new GroupService(this.document);
      this.commands = new CommandManager(this.events);
      this.input = new InputManager(this);
      this.spatialIndex = new SpatialIndexService(this.document, this.events);
      this.shapeQuery = new ShapeQueryService(this.document, this.spatialIndex);
    }
    /**
     * Subscribe to editor events
     * @param event - Event name
     * @param callback - Callback function
     * @returns Unsubscribe function
     */
    on(event, callback) {
      return this.events.on(event, callback);
    }
    /**
     * Emit an event (for internal use)
     * @param event - Event name
     * @param data - Event data
     */
    emit(event, data) {
      this.events.emit(event, data);
    }
    addTools(tools) {
      this.tools.addTools(tools);
    }
    setActiveTool(tool) {
      this.commands.execute(new SetToolCommand(this, tool));
    }
    updateToolOptions(options) {
      this.commands.execute(new UpdateToolOptionsCommand(this, options));
    }
    getToolOption(key) {
      return this.state.getToolOption(key);
    }
    onPointerDown(e) {
      this.input.handlePointerDown(e);
    }
    onPointerMove(e) {
      this.input.handlePointerMove(e);
    }
    onPointerUp(e) {
      this.input.handlePointerUp(e);
    }
    onKeyDown(e) {
      this.input.handleKeyDown(e);
    }
    onKeyUp(e) {
      this.input.handleKeyUp(e);
    }
    setRenderer(renderer) {
      this.renderer = renderer;
    }
    clear() {
      this.commands.execute(new ClearCommand(this));
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
     * Get center position for a node + shape
     * Node provides position, shape provides dimensions
     */
    static getShapeCenter(node, shape) {
      if (shape.type === "LINE") {
        return {
          x: node.transform.x + (shape.geometry.x1 + shape.geometry.x2) / 2,
          y: node.transform.y + (shape.geometry.y1 + shape.geometry.y2) / 2
        };
      }
      return {
        x: node.transform.x + shape.geometry.width / 2,
        y: node.transform.y + shape.geometry.height / 2
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
      if (shape.type === "LINE") {
        return this.getLineHandleGeometry(shape);
      }
      return this.getRectangularHandleGeometry(shape);
    }
    static getLineHandleGeometry(shape) {
      const centerX = (shape.geometry.x1 + shape.geometry.x2) / 2;
      const centerY = (shape.geometry.y1 + shape.geometry.y2) / 2;
      const relP1X = shape.geometry.x1 - centerX;
      const relP1Y = shape.geometry.y1 - centerY;
      const relP2X = shape.geometry.x2 - centerX;
      const relP2Y = shape.geometry.y2 - centerY;
      const length = Math.sqrt(
        Math.pow(shape.geometry.x2 - shape.geometry.x1, 2) + Math.pow(shape.geometry.y2 - shape.geometry.y1, 2)
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
      const halfW = shape.geometry.width / 2;
      const halfH = shape.geometry.height / 2;
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

  // editor-engine/core/tools/select/states/IdleState.ts
  var IdleState = class {
    constructor() {
      this.lastPointerEvent = null;
    }
    onPointerDown(e, ctx) {
    }
    onPointerMove(e, { editor }) {
      this.lastPointerEvent = e;
      this.updateHoverState(e, editor);
    }
    onPointerUp(e, ctx) {
    }
    onKeyDown(e, ctx) {
      if ((e.key === "Control" || e.key === "Meta") && this.lastPointerEvent) {
        const updatedPointerEvent = {
          ...this.lastPointerEvent,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey
        };
        this.updateHoverState(updatedPointerEvent, ctx.editor);
      }
    }
    onKeyUp(e, ctx) {
      if ((e.key === "Control" || e.key === "Meta") && this.lastPointerEvent) {
        const updatedPointerEvent = {
          ...this.lastPointerEvent,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey
        };
        this.updateHoverState(updatedPointerEvent, ctx.editor);
      }
    }
    /**
     * Recalculate hover state based on current pointer position and modifier keys
     * Called when pointer moves or when Ctrl/Meta keys are pressed/released
     */
    updateHoverState(e, editor) {
      var _a, _b;
      const selection = editor.selection.getAll();
      if (selection.length === 1) {
        const handleHit = this.testSingleSelectionHandles(e, editor, selection[0]);
        if (handleHit.type) {
          editor.state.hoveredNodeId = void 0;
          return;
        }
      }
      const found = editor.shapeQuery.findShapeAtPoint(
        e.clientX,
        e.clientY,
        (_a = editor.renderer) == null ? void 0 : _a.getHitTestAdapter()
      );
      const isFoundShapeSelected = (found == null ? void 0 : found.id) && editor.selection.isSelected(found.id);
      const topLevelParent = !(e.ctrlKey || e.metaKey) && !isFoundShapeSelected && editor.document.getTopLevelParent((_b = found == null ? void 0 : found.id) != null ? _b : "");
      const selectionCandidateId = topLevelParent && topLevelParent.id !== (found == null ? void 0 : found.id) ? topLevelParent.id : found == null ? void 0 : found.id;
      editor.state.hoveredNodeId = selectionCandidateId;
    }
    testSingleSelectionHandles(e, editor, nodeId) {
      const node = editor.document.getNode(nodeId);
      const shape = editor.document.getShape(nodeId);
      if (node && shape) {
        const geometry = HandleGeometryService.getShapeHandleGeometry(shape);
        const center = HandleHitTestService.getShapeCenter(node, shape);
        return HandleHitTestService.testHandles(
          e.clientX,
          e.clientY,
          geometry,
          center.x,
          center.y,
          node.transform.rotation
        );
      }
      return { type: null, handle: null };
    }
  };

  // editor-engine/core/tools/select/resolvers/StateResolver.ts
  var StateResolver = class {
    constructor() {
      this.nextResolver = null;
    }
    /**
     * Set the next resolver in the chain
     */
    setNext(resolver) {
      this.nextResolver = resolver;
      return resolver;
    }
    /**
     * Handle the request - try to resolve state, or pass to next in chain
     */
    resolve(e, ctx) {
      const state = this.tryResolve(e, ctx);
      if (state !== null) {
        return state;
      }
      if (this.nextResolver) {
        return this.nextResolver.resolve(e, ctx);
      }
      return null;
    }
  };

  // editor-engine/core/tools/select/resolvers/BaseHandleResolver.ts
  var BaseHandleResolver = class extends StateResolver {
    tryResolve(e, ctx) {
      const handleHit = this.testHandles(e, ctx.editor);
      if (this.isValidHandleType(handleHit.type) && handleHit.handle) {
        return this.createState(handleHit.handle);
      }
      return null;
    }
    /**
     * Test if pointer hits any handle of the appropriate type
     */
    testHandles(e, editor) {
      const selection = editor.selection.getAll();
      if (editor.state.selectionBounds && selection.length > 1) {
        return this.testAABBHandles(e, editor);
      }
      if (selection.length === 1) {
        return this.testSingleSelectionHandles(e, editor, selection[0]);
      }
      return { type: null, handle: null };
    }
    /**
     * Test AABB handles for multi-selection or groups
     */
    testAABBHandles(e, editor) {
      if (!editor.state.selectionBounds) {
        return { type: null, handle: null };
      }
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
    /**
     * Test handles for a single selected node (shape or group)
     */
    testSingleSelectionHandles(e, editor, nodeId) {
      const node = editor.document.getNode(nodeId);
      const shape = editor.document.getShape(nodeId);
      if (node && !shape && editor.state.selectionBounds) {
        return this.testAABBHandles(e, editor);
      }
      if (node && shape) {
        const geometry = HandleGeometryService.getShapeHandleGeometry(shape);
        const center = HandleHitTestService.getShapeCenter(node, shape);
        return HandleHitTestService.testHandles(
          e.clientX,
          e.clientY,
          geometry,
          center.x,
          center.y,
          node.transform.rotation
        );
      }
      return { type: null, handle: null };
    }
  };

  // editor-engine/core/tools/select/helpers/SelectionBoundsHelper.ts
  var SelectionBoundsHelper = class {
    static updateSelectionBounds(ctx) {
      const { editor } = ctx;
      const selection = editor.selection.getAll();
      editor.state.selectionBounds = void 0;
      const selectedShapesAABB = [];
      selection.forEach((nodeId) => {
        const node = editor.document.getNode(nodeId);
        if (!node) return;
        if (isGroupNode(node)) {
          this.collectGroupAABBs(nodeId, editor, selectedShapesAABB);
        } else {
          const shape = editor.document.getShape(nodeId);
          if (shape) {
            selectedShapesAABB.push(BoundingBoxService.getAABB(node, shape));
          }
        }
      });
      if (selectedShapesAABB.length > 0) {
        editor.state.selectionBounds = BoundingBoxService.unionAABBs(selectedShapesAABB);
      }
    }
    /**
     * Recursively collect AABBs from all shape nodes within a group
     */
    static collectGroupAABBs(groupId, editor, aabbs) {
      const group = editor.document.getNode(groupId);
      if (!group || !isGroupNode(group)) return;
      for (const childId of group.children) {
        const child = editor.document.getNode(childId);
        if (!child) continue;
        if (isGroupNode(child)) {
          this.collectGroupAABBs(childId, editor, aabbs);
        } else {
          const shape = editor.document.getShape(childId);
          if (shape) {
            aabbs.push(BoundingBoxService.getAABB(child, shape));
          }
        }
      }
    }
    static clearSelectionBounds(ctx) {
      ctx.editor.state.selectionBounds = void 0;
    }
  };

  // editor-engine/core/tools/select/states/ResizeState.ts
  var ResizeState = class {
    constructor(handleType) {
      this.handleType = handleType;
      this.startMouse = { x: 0, y: 0 };
      this.originalData = /* @__PURE__ */ new Map();
    }
    onEnter(ctx) {
      const { editor } = ctx;
      editor.selection.getAll().forEach((nodeId) => {
        this.collectOriginalData(nodeId, editor);
      });
    }
    collectOriginalData(nodeId, editor) {
      const node = editor.document.getNode(nodeId);
      if (!node) return;
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.collectOriginalData(childId, editor);
        }
      } else {
        const shape = editor.document.getShape(nodeId);
        if (shape) {
          this.originalData.set(nodeId, {
            node: JSON.parse(JSON.stringify(node)),
            shape: JSON.parse(JSON.stringify(shape))
          });
        }
      }
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
        const node = editor.document.getNode(selection[0]);
        if (node && isGroupNode(node) && editor.state.selectionBounds) {
          this.resizeMultipleShapes(editor, dx, dy, this.handleType);
        } else {
          const shape = editor.document.getShape(selection[0]);
          const original = this.originalData.get(selection[0]);
          if (!node || !shape || !original) return;
          this.resizeSingleShape(node, shape, original, dx, dy, this.handleType);
          editor.document.updateNode(node);
          editor.document.updateShape(shape);
        }
      } else if (selection.length > 1 && editor.state.selectionBounds) {
        this.resizeMultipleShapes(editor, dx, dy, this.handleType);
      }
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
      ctx.renderOverlays();
    }
    onPointerUp(e, ctx) {
      const { editor } = ctx;
      const transforms = [];
      this.originalData.forEach((_, nodeId) => {
        const node = editor.document.getNode(nodeId);
        const shape = editor.document.getShape(nodeId);
        if (node) {
          transforms.push({
            nodeId,
            newNode: JSON.parse(JSON.stringify(node)),
            newShape: shape ? JSON.parse(JSON.stringify(shape)) : void 0
          });
        }
      });
      if (transforms.length > 0) {
        editor.commands.execute(
          new TransformShapesCommand(editor, transforms, "resize")
        );
      }
    }
    resizeSingleShape(node, shape, original, dx, dy, handle) {
      if (shape.type === "LINE" && original.shape.type === "LINE") {
        this.resizeLine(shape, original.shape, dx, dy, handle);
      } else if ((shape.type === "RECTANGLE" || shape.type === "ELLIPSE") && (original.shape.type === "RECTANGLE" || original.shape.type === "ELLIPSE")) {
        this.resizeRectangular(node, shape, original, dx, dy, handle);
      }
    }
    resizeLine(shape, original, dx, dy, handle) {
      if (handle === "p1") {
        shape.geometry.x1 = original.geometry.x1 + dx;
        shape.geometry.y1 = original.geometry.y1 + dy;
      } else if (handle === "p2") {
        shape.geometry.x2 = original.geometry.x2 + dx;
        shape.geometry.y2 = original.geometry.y2 + dy;
      }
    }
    resizeRectangular(node, shape, original, dx, dy, handle) {
      const originalShape = original.shape;
      const rotation = original.node.transform.rotation;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;
      const cosPos = Math.cos(rotation);
      const sinPos = Math.sin(rotation);
      const origHalfW = originalShape.geometry.width / 2;
      const origHalfH = originalShape.geometry.height / 2;
      const origCenterX = original.node.transform.x + origHalfW;
      const origCenterY = original.node.transform.y + origHalfH;
      let newWidth = originalShape.geometry.width;
      let newHeight = originalShape.geometry.height;
      let anchorCenterX = 0;
      let anchorCenterY = 0;
      switch (handle) {
        case "nw":
          newWidth = Math.max(1, originalShape.geometry.width - localDx);
          newHeight = Math.max(1, originalShape.geometry.height - localDy);
          anchorCenterX = origHalfW;
          anchorCenterY = origHalfH;
          break;
        case "ne":
          newWidth = Math.max(1, originalShape.geometry.width + localDx);
          newHeight = Math.max(1, originalShape.geometry.height - localDy);
          anchorCenterX = -origHalfW;
          anchorCenterY = origHalfH;
          break;
        case "se":
          newWidth = Math.max(1, originalShape.geometry.width + localDx);
          newHeight = Math.max(1, originalShape.geometry.height + localDy);
          anchorCenterX = -origHalfW;
          anchorCenterY = -origHalfH;
          break;
        case "sw":
          newWidth = Math.max(1, originalShape.geometry.width - localDx);
          newHeight = Math.max(1, originalShape.geometry.height + localDy);
          anchorCenterX = origHalfW;
          anchorCenterY = -origHalfH;
          break;
        case "n":
          newHeight = Math.max(1, originalShape.geometry.height - localDy);
          anchorCenterX = 0;
          anchorCenterY = origHalfH;
          break;
        case "e":
          newWidth = Math.max(1, originalShape.geometry.width + localDx);
          anchorCenterX = -origHalfW;
          anchorCenterY = 0;
          break;
        case "s":
          newHeight = Math.max(1, originalShape.geometry.height + localDy);
          anchorCenterX = 0;
          anchorCenterY = -origHalfH;
          break;
        case "w":
          newWidth = Math.max(1, originalShape.geometry.width - localDx);
          anchorCenterX = origHalfW;
          anchorCenterY = 0;
          break;
      }
      shape.geometry.width = newWidth;
      shape.geometry.height = newHeight;
      const anchorWorldOffsetX = anchorCenterX * cosPos - anchorCenterY * sinPos;
      const anchorWorldOffsetY = anchorCenterX * sinPos + anchorCenterY * cosPos;
      const anchorWorldX = origCenterX + anchorWorldOffsetX;
      const anchorWorldY = origCenterY + anchorWorldOffsetY;
      const newHalfW = newWidth / 2;
      const newHalfH = newHeight / 2;
      let newAnchorCenterX = 0;
      let newAnchorCenterY = 0;
      switch (handle) {
        case "nw":
          newAnchorCenterX = newHalfW;
          newAnchorCenterY = newHalfH;
          break;
        case "ne":
          newAnchorCenterX = -newHalfW;
          newAnchorCenterY = newHalfH;
          break;
        case "se":
          newAnchorCenterX = -newHalfW;
          newAnchorCenterY = -newHalfH;
          break;
        case "sw":
          newAnchorCenterX = newHalfW;
          newAnchorCenterY = -newHalfH;
          break;
        case "n":
          newAnchorCenterX = 0;
          newAnchorCenterY = newHalfH;
          break;
        case "e":
          newAnchorCenterX = -newHalfW;
          newAnchorCenterY = 0;
          break;
        case "s":
          newAnchorCenterX = 0;
          newAnchorCenterY = -newHalfH;
          break;
        case "w":
          newAnchorCenterX = newHalfW;
          newAnchorCenterY = 0;
          break;
      }
      const newAnchorWorldOffsetX = newAnchorCenterX * cosPos - newAnchorCenterY * sinPos;
      const newAnchorWorldOffsetY = newAnchorCenterX * sinPos + newAnchorCenterY * cosPos;
      const newCenterX = anchorWorldX - newAnchorWorldOffsetX;
      const newCenterY = anchorWorldY - newAnchorWorldOffsetY;
      node.transform.x = newCenterX - newHalfW;
      node.transform.y = newCenterY - newHalfH;
    }
    resizeMultipleShapes(editor, dx, dy, handle) {
    }
  };

  // editor-engine/core/tools/select/resolvers/ResizeHandleResolver.ts
  var ResizeHandleResolver = class extends BaseHandleResolver {
    /**
     * Accept corner and edge handle types for resize operations
     */
    isValidHandleType(type) {
      return type === "corner" || type === "edge";
    }
    /**
     * Create a ResizeState with the detected handle
     */
    createState(handle) {
      return new ResizeState(handle);
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
      if (editor.state.selectionBounds) {
        const bounds = editor.state.selectionBounds;
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        this.centerPoint = {
          x: bounds.minX + width / 2,
          y: bounds.minY + height / 2
        };
        if (selection.length === 1) {
          const node = editor.document.getNode(selection[0]);
          if (node && isGroupNode(node)) {
            for (const childId of node.children) {
              this.collectOriginalTransforms(childId, editor);
            }
          } else {
            const shape = editor.document.getShape(selection[0]);
            if (node && shape) {
              this.originalTransforms.set(node.id, {
                x: node.transform.x,
                y: node.transform.y,
                rotation: node.transform.rotation
              });
            }
          }
        } else {
          selection.forEach((nodeId) => {
            this.collectOriginalTransforms(nodeId, editor);
          });
        }
      }
    }
    collectOriginalTransforms(nodeId, editor) {
      const node = editor.document.getNode(nodeId);
      if (!node) return;
      this.originalTransforms.set(node.id, {
        x: node.transform.x,
        y: node.transform.y,
        rotation: node.transform.rotation
      });
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.collectOriginalTransforms(childId, editor);
        }
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
        const node = editor.document.getNode(selection[0]);
        const shape = editor.document.getShape(selection[0]);
        if (node && !shape && isGroupNode(node)) {
          const originalGroupRotation = node.transform.rotation;
          node.transform.rotation = originalGroupRotation + deltaAngle;
          editor.document.updateNode(node);
          this.rotateAllNodes(editor, deltaAngle);
        } else if (node && shape) {
          const original = this.originalTransforms.get(node.id);
          if (original) {
            if (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") {
              node.transform.rotation = original.rotation + deltaAngle;
            } else if (shape.type === "LINE") {
              const centerWorldX = node.transform.x + (shape.geometry.x1 + shape.geometry.x2) / 2;
              const centerWorldY = node.transform.y + (shape.geometry.y1 + shape.geometry.y2) / 2;
              const dx = shape.geometry.x1 - (shape.geometry.x1 + shape.geometry.x2) / 2;
              const dy = shape.geometry.y1 - (shape.geometry.y1 + shape.geometry.y2) / 2;
              const radius = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(
                e.clientY - centerWorldY,
                e.clientX - centerWorldX
              );
              const centerLocalX = (shape.geometry.x1 + shape.geometry.x2) / 2;
              const centerLocalY = (shape.geometry.y1 + shape.geometry.y2) / 2;
              shape.geometry.x2 = centerLocalX + radius * Math.cos(angle);
              shape.geometry.y2 = centerLocalY + radius * Math.sin(angle);
              shape.geometry.x1 = centerLocalX - radius * Math.cos(angle);
              shape.geometry.y1 = centerLocalY - radius * Math.sin(angle);
              editor.document.updateShape(shape);
            }
            editor.document.updateNode(node);
          }
        }
      } else {
        this.rotateAllNodes(editor, deltaAngle);
      }
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
      ctx.renderOverlays();
    }
    /**
     * Rotate all nodes that have stored original transforms
     * Used for multi-select and group rotation
     * Both position and rotation are updated - shapes rotate around center AND rotate individually
     */
    rotateAllNodes(editor, deltaAngle) {
      this.originalTransforms.forEach((original, nodeId) => {
        const node = editor.document.getNode(nodeId);
        if (node) {
          const rotatedPos = this.rotatePoint(
            original.x,
            original.y,
            this.centerPoint.x,
            this.centerPoint.y,
            deltaAngle
          );
          node.transform.x = rotatedPos.x;
          node.transform.y = rotatedPos.y;
          node.transform.rotation = original.rotation + deltaAngle;
          editor.document.updateNode(node);
        }
      });
    }
    onPointerUp(e, ctx) {
      const { editor } = ctx;
      const transforms = [];
      this.originalTransforms.forEach((_, nodeId) => {
        const node = editor.document.getNode(nodeId);
        const shape = editor.document.getShape(nodeId);
        if (node) {
          transforms.push({
            nodeId,
            newNode: JSON.parse(JSON.stringify(node)),
            newShape: shape ? JSON.parse(JSON.stringify(shape)) : void 0
          });
        }
      });
      if (transforms.length > 0) {
        editor.commands.execute(
          new TransformShapesCommand(editor, transforms, "rotate")
        );
      }
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
    getShapeCenter(node, shape) {
      if (shape.type === "LINE") {
        const midX = (shape.geometry.x1 + shape.geometry.x2) / 2;
        const midY = (shape.geometry.y1 + shape.geometry.y2) / 2;
        return {
          x: node.transform.x + midX,
          y: node.transform.y + midY
        };
      } else {
        return {
          x: node.transform.x + shape.geometry.width / 2,
          y: node.transform.y + shape.geometry.height / 2
        };
      }
    }
  };

  // editor-engine/core/tools/select/resolvers/RotationHandleResolver.ts
  var RotationHandleResolver = class extends BaseHandleResolver {
    /**
     * Accept rotation handle type for rotate operations
     */
    isValidHandleType(type) {
      return type === "rotation";
    }
    /**
     * Create a RotateState with the detected handle
     */
    createState(handle) {
      return new RotateState(handle);
    }
  };

  // editor-engine/core/tools/select/states/DragState.ts
  var DragState = class {
    constructor(selectionContext) {
      this.prevMouseX = 0;
      this.prevMouseY = 0;
      this.movedNodes = /* @__PURE__ */ new Map();
      this.hasMoved = false;
      this.selectionContext = selectionContext;
    }
    onPointerDown(e, ctx) {
      if (this.selectionContext) {
        this.applySelection(ctx);
      }
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
    /**
     * Apply selection based on the provided context
     * This separates the concern of selection from the resolver
     */
    applySelection(ctx) {
      if (!this.selectionContext) return;
      const { nodeToSelect, shouldAddToSelection } = this.selectionContext;
      const { editor } = ctx;
      if (shouldAddToSelection) {
        editor.selection.select(nodeToSelect);
      } else {
        editor.selection.setSingle(nodeToSelect);
      }
      SelectionBoundsHelper.updateSelectionBounds(ctx);
      this.updateToolOptionsFromSelection(editor, nodeToSelect);
    }
    /**
     * Update tool options (strokeColor, fillColor) from the selected shape's style
     */
    updateToolOptionsFromSelection(editor, nodeId) {
      const shape = editor.document.getShape(nodeId);
      console.log(
        "\u{1F50D} DragState - updateToolOptionsFromSelection - nodeId:",
        nodeId,
        "shape:",
        shape
      );
      if (shape) {
        console.log(
          "\u{1F3A8} DragState - Executing UpdateToolOptionsCommand with colors:",
          {
            strokeColor: shape.style.strokeColor,
            fillColor: shape.style.fillColor
          }
        );
        editor.commands.execute(
          new UpdateToolOptionsCommand(editor, {
            strokeColor: shape.style.strokeColor,
            fillColor: shape.style.fillColor
          })
        );
      }
    }
    onPointerMove(e, ctx) {
      var _a;
      const { editor } = ctx;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.hasMoved = true;
      editor.selection.getAll().forEach((nodeId) => {
        const node = editor.document.getNode(nodeId);
        if (!node) return;
        if (isGroupNode(node)) {
          this.moveNodeRecursive(nodeId, deltaX, deltaY, editor);
        } else {
          node.transform.x += deltaX;
          node.transform.y += deltaY;
          editor.document.updateNode(node);
        }
      });
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds(ctx);
    }
    /**
     * Move a node and all its children recursively (for groups)
     */
    moveNodeRecursive(nodeId, deltaX, deltaY, editor) {
      const node = editor.document.getNode(nodeId);
      if (!node) return;
      node.transform.x += deltaX;
      node.transform.y += deltaY;
      editor.document.updateNode(node);
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.moveNodeRecursive(childId, deltaX, deltaY, editor);
        }
      }
    }
    onPointerUp(e, ctx) {
      if (this.hasMoved) {
        const { editor } = ctx;
        const transforms = [];
        editor.selection.getAll().forEach((nodeId) => {
          this.collectTransformedNodes(nodeId, editor, transforms);
        });
        if (transforms.length > 0) {
          editor.commands.execute(
            new TransformShapesCommand(editor, transforms, "move")
          );
        }
      }
    }
    /**
     * Collect all transformed nodes recursively (including group children)
     */
    collectTransformedNodes(nodeId, editor, transforms) {
      const node = editor.document.getNode(nodeId);
      if (!node) return;
      if (isGroupNode(node)) {
        for (const childId of node.children) {
          this.collectTransformedNodes(childId, editor, transforms);
        }
      } else {
        const shape = editor.document.getShape(nodeId);
        transforms.push({
          nodeId,
          newNode: JSON.parse(JSON.stringify(node)),
          newShape: shape ? JSON.parse(JSON.stringify(shape)) : void 0
        });
      }
    }
  };

  // editor-engine/core/tools/select/resolvers/SelectedObjectResolver.ts
  var SelectedObjectResolver = class extends StateResolver {
    tryResolve(e, ctx) {
      const { editor } = ctx;
      if (!editor.state.hoveredNodeId) {
        return null;
      }
      if (this.isHoveredShapeInCurrentSelection(e, editor)) {
        return new DragState();
      }
      return null;
    }
    /**
     * Check if the hovered node corresponds to the current selection.
     * - Without Ctrl/Cmd: selection is considered at the top-level parent (group) level.
     * - With Ctrl/Cmd: selection is considered at the hovered node level (drill-down).
     */
    isHoveredShapeInCurrentSelection(e, editor) {
      const hoveredNodeId = editor.state.hoveredNodeId;
      if (!hoveredNodeId) return false;
      return editor.selection.isSelected(hoveredNodeId);
    }
  };

  // editor-engine/core/tools/select/resolvers/HoveredObjectResolver.ts
  var HoveredObjectResolver = class extends StateResolver {
    tryResolve(e, ctx) {
      const { editor } = ctx;
      if (!editor.state.hoveredNodeId) {
        return null;
      }
      const nodeToSelect = this.determineNodeToSelect(e, editor);
      return new DragState({
        nodeToSelect,
        shouldAddToSelection: e.shiftKey
      });
    }
    /**
     * Determine which node to select based on modifier keys and hierarchy
     */
    determineNodeToSelect(e, editor) {
      const hoveredNodeId = editor.state.hoveredNodeId;
      return hoveredNodeId;
    }
  };

  // editor-engine/core/tools/select/states/MarqueeState.ts
  var MarqueeState = class {
    constructor() {
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, ctx) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
    }
    onPointerMove(e, { editor }) {
      const minX = Math.min(this.mouseStart.x, e.clientX);
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
      const maxY = Math.max(this.mouseStart.y, e.clientY);
      this.marqueeBox = {
        minX,
        minY,
        maxX,
        maxY
      };
      editor.state.marquee = this.marqueeBox;
    }
    onPointerUp(e, ctx) {
      const { editor } = ctx;
      if (editor.state.marquee) {
        const marquee = editor.state.marquee;
        const shapesInRegion = editor.shapeQuery.findShapesInRegion(
          marquee.minX,
          marquee.minY,
          marquee.maxX,
          marquee.maxY
        );
        shapesInRegion.forEach((node) => {
          editor.selection.select(node.id);
        });
      }
      this.marqueeBox = void 0;
      editor.state.marquee = void 0;
      SelectionBoundsHelper.updateSelectionBounds(ctx);
    }
  };

  // editor-engine/core/tools/select/resolvers/BackgroundResolver.ts
  var BackgroundResolver = class extends StateResolver {
    tryResolve(e, ctx) {
      ctx.editor.selection.clear();
      ctx.editor.state.clearTransient();
      return new MarqueeState();
    }
  };

  // editor-engine/core/tools/select/strategies/StateTransitionResolver.ts
  var StateTransitionResolver = class {
    constructor() {
      const resizeResolver = new ResizeHandleResolver();
      const rotationResolver = new RotationHandleResolver();
      const selectedObjectResolver = new SelectedObjectResolver();
      const hoveredObjectResolver = new HoveredObjectResolver();
      const backgroundResolver = new BackgroundResolver();
      resizeResolver.setNext(rotationResolver).setNext(selectedObjectResolver).setNext(hoveredObjectResolver).setNext(backgroundResolver);
      this.chainHead = resizeResolver;
    }
    /**
     * Resolve the next interaction state based on pointer event and context
     * Delegates to the chain of resolvers
     */
    resolve(e, ctx) {
      const state = this.chainHead.resolve(e, ctx);
      return state != null ? state : new IdleState();
    }
  };

  // editor-engine/core/tools/select/SelectTool.ts
  var SelectTool = class {
    constructor() {
      this.id = "select";
      this.currentState = new IdleState();
      this.stateResolver = new StateTransitionResolver();
    }
    onPointerDown(e, ctx) {
      const nextState = this.stateResolver.resolve(e, ctx);
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
      this.transitionTo(new IdleState(), ctx);
      ctx.renderOverlays();
    }
    onKeyDown(e, ctx) {
      var _a, _b;
      if (e.key === "Delete" || e.key === "Backspace") {
        this.handleDelete(ctx);
        e.preventDefault();
        return;
      }
      (_b = (_a = this.currentState).onKeyDown) == null ? void 0 : _b.call(_a, e, ctx);
      ctx.renderOverlays();
    }
    onKeyUp(e, ctx) {
      var _a, _b;
      (_b = (_a = this.currentState).onKeyUp) == null ? void 0 : _b.call(_a, e, ctx);
      ctx.renderOverlays();
    }
    handleDelete(ctx) {
      const selectedIds = ctx.editor.selection.getAll();
      if (selectedIds.length === 0) return;
      ctx.editor.commands.execute(
        new DeleteShapesCommand(ctx.editor, [...selectedIds])
      );
      ctx.renderOverlays();
    }
    transitionTo(state, ctx) {
      var _a, _b, _c, _d;
      (_b = (_a = this.currentState).onExit) == null ? void 0 : _b.call(_a, ctx);
      this.currentState = state;
      (_d = (_c = this.currentState).onEnter) == null ? void 0 : _d.call(_c, ctx);
    }
  };

  // editor-engine/core/tools/ToolConstants.ts
  var TOOL_IDS = {
    SELECT: "select",
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    LINE: "line"
  };

  // editor-engine/core/tools/BaseShapeTool.ts
  var BaseShapeTool = class {
    constructor() {
      this.hasDragged = false;
    }
    onPointerUp(e, { editor }) {
      var _a;
      if (this.draftNodeId) {
        if (!this.hasDragged) {
          editor.document.removeNode(this.draftNodeId);
          editor.selection.clear();
          (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
          this.draftNodeId = void 0;
          this.hasDragged = false;
          return;
        }
        const node = editor.document.getNode(this.draftNodeId);
        const shape = editor.document.getShape(this.draftNodeId);
        if (node && shape) {
          editor.document.removeNode(this.draftNodeId);
          editor.commands.execute(new CreateShapeCommand(editor, node, shape));
        }
        this.draftNodeId = void 0;
        this.hasDragged = false;
        editor.setActiveTool(TOOL_IDS.SELECT);
      }
    }
    /**
     * Reset tool state
     */
    resetState() {
      this.draftNodeId = void 0;
      this.hasDragged = false;
    }
  };

  // editor-engine/core/tools/LineTool.ts
  var LineTool = class extends BaseShapeTool {
    constructor() {
      super(...arguments);
      this.id = TOOL_IDS.LINE;
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, { editor }) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.hasDragged = false;
      const nodeId = crypto.randomUUID();
      this.draftNodeId = nodeId;
      const node = createShapeNode(
        nodeId,
        {
          x: e.clientX,
          y: e.clientY,
          rotation: 0
        },
        {
          existingNodes: editor.document.getAllNodes(),
          existingShapes: editor.document.getShapesMap(),
          shapeType: "LINE" /* LINE */
        }
      );
      const shape = createLineShape(
        nodeId,
        {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          lineWidth: 4
        },
        {
          fillColor: editor.state.toolOptions.fillColor,
          strokeColor: editor.state.toolOptions.strokeColor
        }
      );
      editor.document.addNode(node);
      editor.document.addShape(shape);
      editor.selection.setSingle(nodeId);
    }
    onPointerMove(e, { editor, renderOverlays }) {
      var _a;
      if (!this.draftNodeId) return;
      const node = editor.document.getNode(this.draftNodeId);
      const shape = editor.document.getShape(this.draftNodeId);
      if (!node || !shape || shape.type !== "LINE" /* LINE */) return;
      const nextX2 = e.clientX - node.transform.x;
      const nextY2 = e.clientY - node.transform.y;
      if (nextX2 === 0 && nextY2 === 0) return;
      this.hasDragged = true;
      shape.geometry.x2 = nextX2;
      shape.geometry.y2 = nextY2;
      editor.document.updateNode(node);
      editor.document.updateShape(shape);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    // onPointerUp inherited from BaseShapeTool
  };

  // editor-engine/core/tools/RectangleTool.ts
  var RectangleTool = class extends BaseShapeTool {
    constructor() {
      super(...arguments);
      this.id = TOOL_IDS.RECTANGLE;
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, { editor }) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.hasDragged = false;
      const nodeId = crypto.randomUUID();
      this.draftNodeId = nodeId;
      const node = createShapeNode(
        nodeId,
        {
          x: this.mouseStart.x,
          y: this.mouseStart.y,
          rotation: 0
        },
        {
          existingNodes: editor.document.getAllNodes(),
          existingShapes: editor.document.getShapesMap(),
          shapeType: "RECTANGLE" /* RECTANGLE */
        }
      );
      const shape = createRectangleShape(
        nodeId,
        {
          width: 0,
          height: 0
        },
        {
          fillColor: editor.state.toolOptions.fillColor,
          strokeColor: editor.state.toolOptions.strokeColor
        }
      );
      editor.document.addNode(node);
      editor.document.addShape(shape);
      editor.selection.setSingle(nodeId);
    }
    onPointerMove(e, { editor, renderOverlays }) {
      var _a;
      if (!this.draftNodeId) return;
      const node = editor.document.getNode(this.draftNodeId);
      const shape = editor.document.getShape(this.draftNodeId);
      if (!node || !shape || shape.type !== "RECTANGLE" /* RECTANGLE */) return;
      const minX = Math.min(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const maxY = Math.max(this.mouseStart.y, e.clientY);
      const width = maxX - minX;
      const height = maxY - minY;
      if (width === 0 && height === 0) return;
      this.hasDragged = true;
      node.transform.x = minX;
      node.transform.y = minY;
      shape.geometry.width = width;
      shape.geometry.height = height;
      editor.document.updateNode(node);
      editor.document.updateShape(shape);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    // onPointerUp inherited from BaseShapeTool
  };

  // editor-engine/core/tools/EllipseTool.ts
  var EllipseTool = class extends BaseShapeTool {
    constructor() {
      super(...arguments);
      this.id = TOOL_IDS.ELLIPSE;
      this.mouseStart = { x: 0, y: 0 };
    }
    onPointerDown(e, { editor }) {
      this.mouseStart = { x: e.clientX, y: e.clientY };
      this.hasDragged = false;
      const nodeId = crypto.randomUUID();
      this.draftNodeId = nodeId;
      const node = createShapeNode(
        nodeId,
        {
          x: this.mouseStart.x,
          y: this.mouseStart.y,
          rotation: 0
        },
        {
          existingNodes: editor.document.getAllNodes(),
          existingShapes: editor.document.getShapesMap(),
          shapeType: "ELLIPSE" /* ELLIPSE */
        }
      );
      const shape = createEllipseShape(
        nodeId,
        {
          width: 0,
          height: 0
        },
        {
          fillColor: editor.state.toolOptions.fillColor,
          strokeColor: editor.state.toolOptions.strokeColor
        }
      );
      editor.document.addNode(node);
      editor.document.addShape(shape);
      editor.selection.setSingle(nodeId);
    }
    onPointerMove(e, { editor, renderOverlays }) {
      var _a;
      if (!this.draftNodeId) return;
      const node = editor.document.getNode(this.draftNodeId);
      const shape = editor.document.getShape(this.draftNodeId);
      if (!node || !shape || shape.type !== "ELLIPSE" /* ELLIPSE */) return;
      const minX = Math.min(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const maxY = Math.max(this.mouseStart.y, e.clientY);
      const width = maxX - minX;
      const height = maxY - minY;
      if (width === 0 && height === 0) return;
      this.hasDragged = true;
      node.transform.x = minX;
      node.transform.y = minY;
      shape.geometry.width = width;
      shape.geometry.height = height;
      editor.document.updateNode(node);
      editor.document.updateShape(shape);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
    }
    // onPointerUp inherited from BaseShapeTool
  };

  // editor-engine/adapters/CanvasPathBuilder.ts
  var CanvasPathBuilder = class {
    constructor() {
    }
    static getPath(shape) {
      switch (shape.type) {
        case "RECTANGLE" /* RECTANGLE */:
          return this.createPathForRectangle(shape);
        case "ELLIPSE" /* ELLIPSE */:
          return this.createPathForEllipse(shape);
        case "LINE" /* LINE */:
          return this.createPathForLine(shape);
        default:
          throw new Error(`Unknown shape type`);
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
      const halfW = shape.geometry.width / 2;
      const halfH = shape.geometry.height / 2;
      path.rect(-halfW, -halfH, shape.geometry.width, shape.geometry.height);
      return path;
    }
    static createPathForEllipse(shape) {
      const path = new Path2D();
      path.ellipse(
        0,
        0,
        Math.abs(shape.geometry.width) / 2,
        Math.abs(shape.geometry.height) / 2,
        0,
        0,
        2 * Math.PI
      );
      return path;
    }
    static createPathForLine(shape) {
      const path = new Path2D();
      const centerX = (shape.geometry.x1 + shape.geometry.x2) / 2;
      const centerY = (shape.geometry.y1 + shape.geometry.y2) / 2;
      path.moveTo(shape.geometry.x1 - centerX, shape.geometry.y1 - centerY);
      path.lineTo(shape.geometry.x2 - centerX, shape.geometry.y2 - centerY);
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
    testShape(node, shape, x, y) {
      this.ctx.save();
      const center = HandleHitTestService.getShapeCenter(node, shape);
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(node.transform.rotation);
      this.ctx.lineWidth = 10;
      const path = CanvasPathBuilder.getPath(shape);
      const hitFound = shape.type === "LINE" ? this.ctx.isPointInStroke(path, x, y) : this.ctx.isPointInPath(path, x, y);
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
      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
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
      this.clear();
      const shapesInLayerOrder = [];
      const roots = this.editor.document.getRootNodes().slice().reverse();
      for (const root of roots) {
        this.collectShapesInLayerOrder(root.id, shapesInLayerOrder);
      }
      for (const [node, shape] of shapesInLayerOrder.reverse()) {
        this.renderShape(node, shape);
      }
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    /** Same traversal as LayerPanel; paint back-to-front by reversing collected shapes. */
    collectShapesInLayerOrder(nodeId, out) {
      const node = this.editor.document.getNode(nodeId);
      if (!node) return;
      const children = node.children.slice().reverse();
      for (const childId of children) {
        this.collectShapesInLayerOrder(childId, out);
      }
      const shape = this.editor.document.getShape(nodeId);
      if (shape) {
        out.push([node, shape]);
      }
    }
    renderShape(node, shape) {
      if (!node.visible) return;
      this.ctx.save();
      this.ctx.fillStyle = shape.style.fillColor;
      this.ctx.strokeStyle = shape.style.strokeColor;
      const path = CanvasPathBuilder.getPath(shape);
      let centerX = node.transform.x;
      let centerY = node.transform.y;
      if (shape.type === "LINE") {
        centerX += (shape.geometry.x1 + shape.geometry.x2) / 2;
        centerY += (shape.geometry.y1 + shape.geometry.y2) / 2;
      } else {
        centerX += shape.geometry.width / 2;
        centerY += shape.geometry.height / 2;
      }
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(node.transform.rotation);
      if (shape.type === "LINE") {
        this.ctx.lineWidth = shape.geometry.lineWidth;
      } else this.ctx.fill(path);
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    applyTransform(center, rotation) {
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rotation);
    }
    renderHoverOutline() {
      if (!this.editor.state.hoveredNodeId) return;
      const hoveredNode = this.editor.document.getNode(
        this.editor.state.hoveredNodeId
      );
      if (!hoveredNode) return;
      const hoveredShape = this.editor.document.getShape(
        this.editor.state.hoveredNodeId
      );
      this.ctx.save();
      this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor;
      this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth;
      if (isGroupNode(hoveredNode)) {
        const bounds = this.getGroupBounds(hoveredNode.id);
        if (bounds) {
          this.ctx.stroke(CanvasPathBuilder.getPathFromAABB(bounds));
        }
        this.ctx.restore();
        return;
      }
      if (!hoveredShape) {
        this.ctx.restore();
        return;
      }
      const path = CanvasPathBuilder.getPath(hoveredShape);
      let centerX = hoveredNode.transform.x;
      let centerY = hoveredNode.transform.y;
      if (hoveredShape.type === "LINE") {
        centerX += (hoveredShape.geometry.x1 + hoveredShape.geometry.x2) / 2;
        centerY += (hoveredShape.geometry.y1 + hoveredShape.geometry.y2) / 2;
      } else {
        centerX += hoveredShape.geometry.width / 2;
        centerY += hoveredShape.geometry.height / 2;
      }
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(hoveredNode.transform.rotation);
      this.ctx.stroke(path);
      this.ctx.restore();
    }
    /** Union AABB of all shape descendants within a group. */
    getGroupBounds(groupId) {
      const aabbs = [];
      this.collectGroupAABBs(groupId, aabbs);
      return aabbs.length > 0 ? BoundingBoxService.unionAABBs(aabbs) : void 0;
    }
    collectGroupAABBs(groupId, aabbs) {
      const group = this.editor.document.getNode(groupId);
      if (!group || !isGroupNode(group)) return;
      for (const childId of group.children) {
        const child = this.editor.document.getNode(childId);
        if (!child) continue;
        if (isGroupNode(child)) {
          this.collectGroupAABBs(childId, aabbs);
        } else {
          const shape = this.editor.document.getShape(childId);
          if (shape) {
            aabbs.push(BoundingBoxService.getAABB(child, shape));
          }
        }
      }
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
        this.drawHandlesForAABB(
          paths,
          this.editor.state.selectionBounds,
          false,
          false
        );
      } else if (selection.length === 1) {
        const node = this.editor.document.getNode(selection[0]);
        const shape = this.editor.document.getShape(selection[0]);
        if (node && !shape && this.editor.state.selectionBounds) {
          const geometry = HandleGeometryService.getAABBHandleGeometry(
            this.editor.state.selectionBounds
          );
          const paths = CanvasPathBuilder.getHandlePaths(geometry);
          this.drawHandlesForAABB(
            paths,
            this.editor.state.selectionBounds,
            false,
            false
          );
        } else if (node && shape) {
          const geometry = HandleGeometryService.getShapeHandleGeometry(shape);
          const paths = CanvasPathBuilder.getHandlePaths(geometry);
          this.drawHandlesForShape(paths, node, shape);
        }
      }
    }
    drawHandlesForAABB(paths, aabb, showCorners = true, showRotation = true) {
      const width = aabb.maxX - aabb.minX;
      const height = aabb.maxY - aabb.minY;
      const centerX = aabb.minX + width / 2;
      const centerY = aabb.minY + height / 2;
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      if (showCorners) {
        this.ctx.fillStyle = EditorConfig.handleOptions.cornerFillColor;
        this.ctx.strokeStyle = EditorConfig.handleOptions.cornerStrokeColor;
        this.ctx.lineWidth = EditorConfig.handleOptions.cornerStrokeWidth;
        for (const path of Object.values(paths.corners)) {
          this.ctx.fill(path);
          this.ctx.stroke(path);
        }
      }
      this.ctx.strokeStyle = EditorConfig.handleOptions.edgeStrokeColor;
      this.ctx.lineWidth = EditorConfig.handleOptions.edgeStrokeWidth;
      for (const path of Object.values(paths.edges)) {
        this.ctx.stroke(path);
      }
      if (showRotation) {
        this.ctx.fillStyle = EditorConfig.handleOptions.rotationFillColor;
        this.ctx.strokeStyle = EditorConfig.handleOptions.rotationStrokeColor;
        this.ctx.lineWidth = EditorConfig.handleOptions.rotationStrokeWidth;
        for (const path of Object.values(paths.rotation)) {
          this.ctx.fill(path);
          this.ctx.stroke(path);
        }
      }
      this.ctx.restore();
    }
    drawHandlesForShape(paths, node, shape) {
      this.ctx.save();
      let centerX = node.transform.x;
      let centerY = node.transform.y;
      if (shape.type === "RECTANGLE" || shape.type === "ELLIPSE") {
        centerX += shape.geometry.width / 2;
        centerY += shape.geometry.height / 2;
      } else if (shape.type === "LINE") {
        centerX += (shape.geometry.x1 + shape.geometry.x2) / 2;
        centerY += (shape.geometry.y1 + shape.geometry.y2) / 2;
      }
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(node.transform.rotation);
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