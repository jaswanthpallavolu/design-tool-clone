// editor-engine/core/model/Shape.ts
// Shape represents the visual/geometric properties of a node
// Transform data (position, rotation) lives in Node, not here

export enum ShapeType {
  RECTANGLE = "RECTANGLE",
  ELLIPSE = "ELLIPSE",
  LINE = "LINE",
}

export interface ShapeStyle {
  fillColor: string
  strokeColor: string
  strokeWidth?: number
}

interface BaseShape {
  nodeId: string // Links to the Node that owns this shape
  style: ShapeStyle
}

export interface RectangleGeometry {
  width: number
  height: number
}

export interface EllipseGeometry {
  width: number
  height: number
}

export interface LineGeometry {
  x1: number // Start point relative to node position
  y1: number
  x2: number // End point relative to node position
  y2: number
  lineWidth: number
}

export interface RectangleShape extends BaseShape {
  type: ShapeType.RECTANGLE
  geometry: RectangleGeometry
}

export interface EllipseShape extends BaseShape {
  type: ShapeType.ELLIPSE
  geometry: EllipseGeometry
}

export interface LineShape extends BaseShape {
  type: ShapeType.LINE
  geometry: LineGeometry
}

export type Shape = RectangleShape | EllipseShape | LineShape

// Type guards for convenience
export function isRectangleShape(shape: Shape): shape is RectangleShape {
  return shape.type === ShapeType.RECTANGLE
}

export function isEllipseShape(shape: Shape): shape is EllipseShape {
  return shape.type === ShapeType.ELLIPSE
}

export function isLineShape(shape: Shape): shape is LineShape {
  return shape.type === ShapeType.LINE
}

// Factory functions for creating shapes
export function createRectangleShape(
  nodeId: string,
  geometry: RectangleGeometry,
  style: ShapeStyle,
): RectangleShape {
  return {
    nodeId,
    type: ShapeType.RECTANGLE,
    geometry,
    style,
  }
}

export function createEllipseShape(
  nodeId: string,
  geometry: EllipseGeometry,
  style: ShapeStyle,
): EllipseShape {
  return {
    nodeId,
    type: ShapeType.ELLIPSE,
    geometry,
    style,
  }
}

export function createLineShape(
  nodeId: string,
  geometry: LineGeometry,
  style: ShapeStyle,
): LineShape {
  return {
    nodeId,
    type: ShapeType.LINE,
    geometry,
    style,
  }
}
