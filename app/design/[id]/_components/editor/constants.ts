import { Circle, MousePointer2, RectangleHorizontal, Minus } from "lucide-react"
import type { Tool, ColorSwatch } from "./types"

export const tools: Tool[] = [
  { id: "select", label: "Select", icon: MousePointer2, isActive: false },
  {
    id: "rectangle",
    label: "Rectangle",
    icon: RectangleHorizontal,
    isActive: true,
  },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "line", label: "Line", icon: Minus },
]

export const colorSwatches: ColorSwatch[] = [
  { id: "blue", className: "from-blue-400 to-blue-600", isActive: true },
  { id: "red", className: "from-red-400 to-red-600" },
  { id: "green", className: "from-green-400 to-green-600" },
  { id: "orange", className: "from-orange-400 to-orange-600" },
  { id: "purple", className: "from-purple-400 to-purple-600" },
  { id: "pink", className: "from-pink-400 to-pink-600" },
  { id: "gray", className: "from-zinc-400 to-zinc-600" },
  { id: "black", className: "from-zinc-800 to-zinc-950" },
]

// Made with Bob
