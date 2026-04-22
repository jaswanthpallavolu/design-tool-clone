// editor-engine/core/model/Node.ts
// Node represents the hierarchical structure of the document tree
// Separates structural concerns (hierarchy, transform, visibility) from visual concerns (shape data)

export enum NodeType {
  GROUP = "GROUP",
  SHAPE = "SHAPE",
}

export interface Transform {
  x: number // Position relative to parent (or world if no parent)
  y: number
  rotation: number // Rotation in radians
}

export interface BaseNode {
  id: string
  type: NodeType
  name: string
  parentId?: string // undefined = root level
  children: string[] // Child node IDs (empty for leaf nodes)
  transform: Transform
  visible: boolean
  locked: boolean
}

export interface GroupNode extends BaseNode {
  type: NodeType.GROUP
  // Groups have no visual properties, only structural
  // Their bounds are computed from children
  // Store original bounding box dimensions (before rotation)
  boundingBox?: {
    width: number
    height: number
  }
}

export interface ShapeNode extends BaseNode {
  type: NodeType.SHAPE
  children: [] // Shape nodes cannot have children (always empty array)
  // Visual properties are stored separately in ShapeData
}

export type Node = GroupNode | ShapeNode

// Type guards for convenience
export function isGroupNode(node: Node): node is GroupNode {
  return node.type === NodeType.GROUP
}

export function isShapeNode(node: Node): node is ShapeNode {
  return node.type === NodeType.SHAPE
}

// Factory functions for creating nodes
export function createGroupNode(
  id: string,
  transform: Transform,
  options?: {
    name?: string
    parentId?: string
    visible?: boolean
    locked?: boolean
  },
): GroupNode {
  return {
    id,
    type: NodeType.GROUP,
    name: options?.name || "Group",
    parentId: options?.parentId,
    children: [],
    transform,
    visible: options?.visible ?? true,
    locked: options?.locked ?? false,
  }
}

export function createShapeNode(
  id: string,
  transform: Transform,
  options?: {
    name?: string
    parentId?: string
    visible?: boolean
    locked?: boolean
  },
): ShapeNode {
  return {
    id,
    type: NodeType.SHAPE,
    name: options?.name || "Shape",
    parentId: options?.parentId,
    children: [],
    transform,
    visible: options?.visible ?? true,
    locked: options?.locked ?? false,
  }
}

// Made with Bob
