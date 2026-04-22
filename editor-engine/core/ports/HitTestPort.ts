import { Node } from "../model/Node"
import { Shape } from "../model/Shape"

export interface HitTestPort {
  testShape(node: Node, shape: Shape, x: number, y: number): boolean
}
