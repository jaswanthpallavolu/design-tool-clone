export interface Shape {
  id: string
  kind: "rectangle" | "ellipse" | "line"
  p1: { x: number; y: number }
  p2?: { x: number; y: number }
  width?: number
  height?: number
  rotation?: number
  center?: { x: number; y: number }
  fillStyle: string
  strokeStyle: string
  lineWidth?: number
}
