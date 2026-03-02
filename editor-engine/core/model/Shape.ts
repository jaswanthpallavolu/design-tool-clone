interface Transform {
  x: number
  y: number
  rotation: number
}

interface BaseShape {
  id: string
  fillStyle: string
  strokeStyle: string
  transform: Transform
}

export interface RectangleShape extends BaseShape {
  kind: "rectangle"
  local: {
    width: number
    height: number
  }
}

export interface EllipseShape extends BaseShape {
  kind: "ellipse"
  local: {
    width: number
    height: number
  }
}

export interface LineShape extends BaseShape {
  kind: "line"
  local: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  lineWidth: number
}

export type Shape = RectangleShape | EllipseShape | LineShape
