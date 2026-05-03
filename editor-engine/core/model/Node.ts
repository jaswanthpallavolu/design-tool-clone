// editor-engine/core/model/Node.ts
// Node represents the hierarchical structure of the document tree
// Separates structural concerns (hierarchy, transform, visibility) from visual concerns (shape data)

import { ShapeType } from "./Shape"

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

// Helper function to count nodes by name prefix
export function countNodesByNamePrefix(
  existingNodes: readonly Node[],
  prefix: string,
): number {
  const regex = new RegExp(`^${prefix}\\s*(\\d*)$`)
  let maxCount = 0

  for (const node of existingNodes) {
    const match = node.name.match(regex)
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 1
      maxCount = Math.max(maxCount, num)
    }
  }

  return maxCount
}

// Helper function to generate unique node name
export function generateNodeName(
  existingNodes: readonly Node[],
  baseName: string,
): string {
  const count = countNodesByNamePrefix(existingNodes, baseName)
  return count === 0 ? baseName : `${baseName} ${count + 1}`
}

// Helper function to count shape nodes by shape type
export function countShapeNodesByType(
  existingNodes: readonly Node[],
  existingShapes: Map<string, { type: ShapeType }>,
  shapeType: ShapeType,
): number {
  const baseNames: Record<ShapeType, string> = {
    [ShapeType.RECTANGLE]: "Rectangle",
    [ShapeType.ELLIPSE]: "Ellipse",
    [ShapeType.LINE]: "Line",
  }

  const baseName = baseNames[shapeType]
  let count = 0

  for (const node of existingNodes) {
    if (node.type === NodeType.SHAPE) {
      const shape = existingShapes.get(node.id)
      if (shape && shape.type === shapeType) {
        // Check if the node name matches the pattern for this shape type
        const regex = new RegExp(`^${baseName}\\s*(\\d*)$`)
        const match = node.name.match(regex)
        if (match) {
          count++
        }
      }
    }
  }

  return count
}

// Helper function to generate shape node name based on shape type
export function generateShapeNodeName(
  existingNodes: readonly Node[],
  existingShapes: Map<string, { type: ShapeType }>,
  shapeType: ShapeType,
): string {
  const baseNames: Record<ShapeType, string> = {
    [ShapeType.RECTANGLE]: "Rectangle",
    [ShapeType.ELLIPSE]: "Ellipse",
    [ShapeType.LINE]: "Line",
  }

  const baseName = baseNames[shapeType]
  const count = countShapeNodesByType(existingNodes, existingShapes, shapeType)

  return `${baseName} ${count}`
}

// Helper function to count group nodes
export function countGroupNodes(existingNodes: readonly Node[]): number {
  const baseName = "Group"
  let count = 0

  for (const node of existingNodes) {
    if (node.type === NodeType.GROUP) {
      // Check if the node name matches the pattern for groups
      const regex = new RegExp(`^${baseName}\\s*(\\d*)$`)
      const match = node.name.match(regex)
      if (match) {
        count++
      }
    }
  }

  return count
}

// Helper function to generate group node name
export function generateGroupNodeName(existingNodes: readonly Node[]): string {
  const count = countGroupNodes(existingNodes)
  return `Group ${count}`
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
    existingNodes?: readonly Node[] // Pass existing nodes to generate unique name
  },
): GroupNode {
  let name = options?.name
  if (!name && options?.existingNodes) {
    name = generateGroupNodeName(options.existingNodes)
  }

  return {
    id,
    type: NodeType.GROUP,
    name: name || "Group",
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
    existingNodes?: readonly Node[] // Pass existing nodes to generate unique name
    existingShapes?: Map<string, { type: ShapeType }> // Pass existing shapes to count by type
    shapeType?: ShapeType // Pass shape type to generate appropriate name
  },
): ShapeNode {
  let name = options?.name
  if (
    !name &&
    options?.existingNodes &&
    options?.existingShapes &&
    options?.shapeType
  ) {
    name = generateShapeNodeName(
      options.existingNodes,
      options.existingShapes,
      options.shapeType,
    )
  }

  return {
    id,
    type: NodeType.SHAPE,
    name: name || "Shape",
    parentId: options?.parentId,
    children: [],
    transform,
    visible: options?.visible ?? true,
    locked: options?.locked ?? false,
  }
}

// Made with Bob
