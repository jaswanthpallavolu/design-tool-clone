import { Shape } from "../model/Shape"
export interface HitTestPort {
  testShape(shape: Shape, x: number, y: number): boolean
}
