// Tool ID constants
export const TOOL_IDS = {
  SELECT: "select",
  RECTANGLE: "rectangle",
  ELLIPSE: "ellipse",
  LINE: "line",
} as const

export type ToolId = (typeof TOOL_IDS)[keyof typeof TOOL_IDS]

// Made with Bob
