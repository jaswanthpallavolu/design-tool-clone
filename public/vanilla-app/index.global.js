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
    ShapeType: () => ShapeType,
    ToolManager: () => ToolManager,
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
      if (nodeIds.length < 1) {
        return null;
      }
      const nodes = [];
      for (const id of nodeIds) {
        const node = this.document.getNode(id);
        if (!node) {
          return null;
        }
        nodes.push(node);
      }
      const parentIds = new Set(nodes.map((n) => {
        var _a;
        return (_a = n.parentId) != null ? _a : "root";
      }));
      if (parentIds.size > 1) {
        return null;
      }
      const commonParentId = nodes[0].parentId;
      const bounds = this.calculateBoundingBox(nodeIds);
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
      this.document.addNode(groupNode);
      for (const node of nodes) {
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
      if (nodeIds.length < 1) return false;
      const nodes = [];
      for (const id of nodeIds) {
        const node = this.document.getNode(id);
        if (!node) return false;
        nodes.push(node);
      }
      const parentIds = new Set(nodes.map((n) => {
        var _a;
        return (_a = n.parentId) != null ? _a : "root";
      }));
      return parentIds.size === 1;
    }
    /**
     * Calculate bounding box for multiple nodes
     * Returns { x, y, width, height } or null if no valid bounds
     */
    calculateBoundingBox(nodeIds) {
      const aabbs = [];
      for (const nodeId of nodeIds) {
        const node = this.document.getNode(nodeId);
        if (!node) continue;
        const shape = this.document.getShape(nodeId);
        if (!shape) continue;
        const aabb = BoundingBoxService.getAABB(node, shape);
        aabbs.push(aabb);
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
      this.editor.events.emit("document:modified");
    }
    /**
     * Handle keyboard down events
     */
    handleKeyDown(e) {
      var _a, _b;
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
      this.groupService = new GroupService(this.document);
      this.events = new EventBus();
      this.commands = new CommandManager(this.events);
      this.input = new InputManager(this);
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
    /**
     * Undo the last command
     * @returns true if undo was successful
     */
    undo() {
      return this.commands.undo();
    }
    /**
     * Redo the next command
     * @returns true if redo was successful
     */
    redo() {
      return this.commands.redo();
    }
    /**
     * Check if undo is available
     */
    canUndo() {
      return this.commands.canUndo();
    }
    /**
     * Check if redo is available
     */
    canRedo() {
      return this.commands.canRedo();
    }
    // ---------------------------------------------
    // Grouping Operations
    // ---------------------------------------------
    /**
     * Group the currently selected nodes
     * Uses GroupCommand for undoable grouping
     */
    groupSelection() {
      this.commands.execute(new GroupCommand(this));
    }
    /**
     * Ungroup the currently selected group nodes
     * Uses UngroupCommand for undoable ungrouping
     */
    ungroupSelection() {
      this.commands.execute(new UngroupCommand(this));
    }
  };

  // editor-engine/core/tools/select/states/IdleState.ts
  var IdleState = class {
    onPointerDown(e, ctx) {
    }
    onPointerMove(e, { editor }) {
      var _a, _b;
      let hoveringOnShape = false;
      if (editor.state.hoveredNodeId) {
        const hoveredNode = editor.document.getNode(editor.state.hoveredNodeId);
        const hoveredShape = editor.document.getShape(editor.state.hoveredNodeId);
        if (hoveredNode && hoveredShape && ((_b = (_a = editor.renderer) == null ? void 0 : _a.getHitTestAdapter()) == null ? void 0 : _b.testShape(hoveredNode, hoveredShape, e.clientX, e.clientY))) {
          hoveringOnShape = true;
        }
      }
      if (!hoveringOnShape) {
        const shapeNodes = editor.document.getShapeNodes();
        const found = shapeNodes.find(
          ([node, shape]) => {
            var _a2, _b2;
            return (_b2 = (_a2 = editor.renderer) == null ? void 0 : _a2.getHitTestAdapter()) == null ? void 0 : _b2.testShape(node, shape, e.clientX, e.clientY);
          }
        );
        editor.state.hoveredNodeId = found ? found[0].id : void 0;
      }
    }
    onPointerUp(e, ctx) {
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
        editor.document.getShapeNodes().forEach(([node, shape]) => {
          const intersect = shape.type === "LINE" ? BoundingBoxService.lineIntersectsAABB(
            node.transform.x + shape.geometry.x1,
            node.transform.y + shape.geometry.y1,
            node.transform.x + shape.geometry.x2,
            node.transform.y + shape.geometry.y2,
            marquee
          ) : BoundingBoxService.aabbIntersects(
            marquee,
            BoundingBoxService.getAABB(node, shape)
          );
          if (intersect) {
            editor.selection.select(node.id);
          }
        });
      }
      this.marqueeBox = void 0;
      editor.state.marquee = void 0;
      SelectionBoundsHelper.updateSelectionBounds(ctx);
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
      const cos = Math.cos(-node.transform.rotation);
      const sin = Math.sin(-node.transform.rotation);
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;
      switch (handle) {
        case "nw":
          shape.geometry.width = originalShape.geometry.width - localDx;
          shape.geometry.height = originalShape.geometry.height - localDy;
          node.transform.x = original.node.transform.x + dx;
          node.transform.y = original.node.transform.y + dy;
          break;
        case "ne":
          shape.geometry.width = originalShape.geometry.width + localDx;
          shape.geometry.height = originalShape.geometry.height - localDy;
          node.transform.y = original.node.transform.y + dy;
          break;
        case "se":
          shape.geometry.width = originalShape.geometry.width + localDx;
          shape.geometry.height = originalShape.geometry.height + localDy;
          break;
        case "sw":
          shape.geometry.width = originalShape.geometry.width - localDx;
          shape.geometry.height = originalShape.geometry.height + localDy;
          node.transform.x = original.node.transform.x + dx;
          break;
        case "n":
          shape.geometry.height = originalShape.geometry.height - localDy;
          node.transform.y = original.node.transform.y + dy;
          break;
        case "e":
          shape.geometry.width = originalShape.geometry.width + localDx;
          break;
        case "s":
          shape.geometry.height = originalShape.geometry.height + localDy;
          break;
        case "w":
          shape.geometry.width = originalShape.geometry.width - localDx;
          node.transform.x = original.node.transform.x + dx;
          break;
      }
      if (shape.geometry.width < 1) shape.geometry.width = 1;
      if (shape.geometry.height < 1) shape.geometry.height = 1;
    }
    resizeMultipleShapes(editor, dx, dy, handle) {
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
        ctx.editor.document.removeNode(id);
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
      if (editor.state.hoveredNodeId) {
        let nodeToSelect = editor.state.hoveredNodeId;
        if (!e.ctrlKey && !e.metaKey) {
          const topLevelParent = editor.document.getTopLevelParent(
            editor.state.hoveredNodeId
          );
          if (topLevelParent && topLevelParent.id !== editor.state.hoveredNodeId) {
            nodeToSelect = topLevelParent.id;
          }
        }
        const hoveredNode = editor.document.getNode(editor.state.hoveredNodeId);
        const hoveredShape = editor.document.getShape(editor.state.hoveredNodeId);
        if (hoveredNode && hoveredShape && editor.state.selectionBounds) {
          if (BoundingBoxService.aabbIntersects(
            editor.state.selectionBounds,
            BoundingBoxService.getAABB(hoveredNode, hoveredShape)
          ))
            return new DragState();
        }
        if (e.shiftKey) editor.selection.select(nodeToSelect);
        else editor.selection.setSingle(nodeToSelect);
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
        const node = editor.document.getNode(selection[0]);
        const shape = editor.document.getShape(selection[0]);
        if (node && !shape && editor.state.selectionBounds) {
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
        } else if (node && shape) {
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
      }
      return { type: null, handle: null };
    }
  };

  // editor-engine/core/tools/LineTool.ts
  var LineTool = class {
    constructor() {
      this.id = "line";
      this.hasDragged = false;
    }
    onPointerDown(e, { editor }) {
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
      editor.document.updateShape(shape);
      (_a = editor.renderer) == null ? void 0 : _a.renderShapes();
      SelectionBoundsHelper.updateSelectionBounds({ editor, renderOverlays });
      renderOverlays();
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
        this.draftNodeId = void 0;
        this.hasDragged = false;
        editor.setActiveTool("select");
      }
    }
  };

  // editor-engine/core/tools/RectangleTool.ts
  var RectangleTool = class {
    constructor() {
      this.id = "rectangle";
      this.mouseStart = { x: 0, y: 0 };
      this.hasDragged = false;
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
      const maxX = Math.max(this.mouseStart.x, e.clientX);
      const minY = Math.min(this.mouseStart.y, e.clientY);
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
        this.draftNodeId = void 0;
        this.hasDragged = false;
        editor.setActiveTool("select");
      }
    }
  };

  // editor-engine/core/tools/EllipseTool.ts
  var EllipseTool = class {
    constructor() {
      this.id = "ellipse";
      this.mouseStart = { x: 0, y: 0 };
      this.hasDragged = false;
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
        this.draftNodeId = void 0;
        this.hasDragged = false;
        editor.setActiveTool("select");
      }
    }
  };

  // editor-engine/adapters/CanvasPathBuilder.ts
  var CanvasPathBuilder = class {
    constructor() {
    }
    static getPath(shape) {
      switch (shape.type) {
        case "RECTANGLE":
          return this.createPathForRectangle(shape);
        case "ELLIPSE":
          return this.createPathForEllipse(shape);
        case "LINE":
          return this.createPathForLine(shape);
        default:
          const _exhaustiveCheck = shape;
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
      this.clear();
      this.editor.document.getShapeNodes().forEach(([node, shape]) => {
        this.renderShape(node, shape);
      });
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
      const hoveredShape = this.editor.document.getShape(
        this.editor.state.hoveredNodeId
      );
      if (!hoveredNode || !hoveredShape) return;
      this.ctx.save();
      this.ctx.strokeStyle = EditorConfig.renderOptions.hoverOutlineColor;
      this.ctx.lineWidth = EditorConfig.renderOptions.hoverOutlineWidth;
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
          true
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
            true
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