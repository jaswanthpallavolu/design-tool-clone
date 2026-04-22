export enum ShapeType {
  RECTANGLE = "RECTANGLE",
  ELLIPSE = "ELLIPSE",
  LINE = "LINE",
}

interface BaseShape {
  id: string
  style: {
    fillColor: string
    strokeColor: string
  }
  geometry: {
    x: number
    y: number
    rotation: number
  }
}

export interface RectangleShape extends BaseShape {
  type: ShapeType.RECTANGLE
  geometry: BaseShape["geometry"] & {
    width: number
    height: number
  }
}

export interface EllipseShape extends BaseShape {
  type: ShapeType.ELLIPSE
  geometry: BaseShape["geometry"] & {
    width: number
    height: number
  }
}

export interface LineShape extends BaseShape {
  type: ShapeType.LINE
  geometry: BaseShape["geometry"] & {
    x1: number
    y1: number
    x2: number
    y2: number
    lineWidth: number
  }
}

export type Shape = RectangleShape | EllipseShape | LineShape
