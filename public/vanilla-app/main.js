const {
  Editor,
  Document,
  SelectionManager,
  ToolManager,
  CanvasRenderer,
  CanvasEventAdapter,
  DrawTool,
  SelectTool,
} = EditorEngine

const toolDropdown = document.getElementById("tool-dropdown")
const colorInput = document.getElementById("color-input")

const tools = [
  { id: "select", name: "select" },
  { id: "rectangle", name: "rectangle" },
  { id: "ellipse", name: "ellipse" },
  { id: "line", name: "line" },
]

tools.forEach((tool) => {
  const option = document.createElement("option")
  option.value = tool.id
  option.textContent = tool.name
  toolDropdown.appendChild(option)
})

const editor = new Editor()
console.log(editor)
