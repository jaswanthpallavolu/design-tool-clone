// Base shape properties
interface BaseShape {
  id: string
  fillStyle: string
  strokeStyle: string
}

// Rectangle-specific shape
export interface RectangleShape extends BaseShape {
  kind: "rectangle"
  p1: { x: number; y: number }
  width: number
  height: number
  rotation: number
}

// Ellipse-specific shape
export interface EllipseShape extends BaseShape {
  kind: "ellipse"
  p1: { x: number; y: number }
  width: number
  height: number
  rotation: number
}

// Line-specific shape
export interface LineShape extends BaseShape {
  kind: "line"
  p1: { x: number; y: number }
  p2: { x: number; y: number }
  lineWidth: number
}

// Discriminated union type
export type Shape = RectangleShape | EllipseShape | LineShape
