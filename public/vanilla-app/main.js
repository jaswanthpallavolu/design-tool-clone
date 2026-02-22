import CanvasEventAdapter from "./CanvasEventAdapter.js"
const {
  Editor,
  Document,
  SelectionManager,
  ToolManager,
  CanvasRenderer,
  DrawTool,
  SelectTool,
  RectangleTool,
  EllipseTool,
  LineTool,
} = EditorEngine
const toolDropdown = document.getElementById("tool-dropdown")
const colorInput = document.getElementById("color-input")
const canvas = document.getElementById("canvas")

const editor = new Editor()

const tools = [
  { id: "select", name: "select", component: SelectTool },
  { id: "rectangle", name: "rectangle", component: RectangleTool },
  { id: "ellipse", name: "ellipse", component: EllipseTool },
  { id: "line", name: "line", component: LineTool },
]

tools.forEach((tool) => {
  const option = document.createElement("option")
  option.value = tool.id
  option.textContent = tool.name
  toolDropdown.appendChild(option)
})
toolDropdown.value = "rectangle"

editor.addTools(tools.map((tool) => new tool.component()))
editor.setActiveTool(toolDropdown.value)

toolDropdown.addEventListener("change", (e) => {
  editor.setActiveTool(e.target.value)
})

colorInput.value = editor.getToolOption("fillColor")

colorInput.addEventListener("input", (e) => {
  editor.updateToolOptions({
    strokeColor: e.target.value,
    fillColor: e.target.value,
  })
})

// CanvasAdapter
new CanvasEventAdapter(canvas, editor)

const renderer = new CanvasRenderer({ canvas, editor })

editor.setRenderer(renderer)
