import CanvasEventAdapter from "./CanvasEventAdapter.js"
const {
  Editor,
  CanvasRenderer,
  SelectTool,
  RectangleTool,
  EllipseTool,
  LineTool,
} = EditorEngine

// DOM elements
const toolDropdown = document.getElementById("tool-dropdown")
const colorInput = document.getElementById("color-input")
const clearButton = document.getElementById("clear-button")
const canvas = document.getElementById("canvas")
const layersSection = document.querySelector(".layers")

// Initialize editor with hybrid architecture (Command Pattern + Event Bus)
const editor = new Editor()

console.log("✅ Editor initialized with Command Pattern and Event Bus")
console.log("📝 Undo/Redo available via Ctrl+Z / Ctrl+Shift+Z")

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

// Subscribe to editor events (Editor → UI)
editor.on("tool:changed", (data) => {
  const { toolId } = data
  toolDropdown.value = toolId
  console.log("🔧 Tool changed:", toolId)
})

editor.on("document:modified", () => {
  renderLayerTree()
  renderer.renderShapes()
  renderer.renderHoverOutline()
  renderer.renderSelectionBox()
  renderer.renderSelectionHandles()
})

editor.on("command:executed", (data) => {
  console.log("✅ Command executed:", data.command)
})

editor.on("command:undone", (data) => {
  console.log("↩️ Command undone:", data.command)
})

editor.on("command:redone", (data) => {
  console.log("↪️ Command redone:", data.command)
})

// UI event handlers (UI → Editor via direct methods)
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

// Viewport initialization
const initViewport = (canvas, onResize) => {
  const resizeCanvas = () => {
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
      onResize()
    }
  }

  const ro = new ResizeObserver(() => {
    // Use requestAnimationFrame to prevent "ResizeObserver loop limit" errors
    window.requestAnimationFrame(resizeCanvas)
  })

  ro.observe(canvas)
  resizeCanvas()
}

// Initialize with redraw callback
initViewport(canvas, () => {
  renderer.renderShapes()
  renderer.renderHoverOutline()
  renderer.renderSelectionBox()
  renderer.renderSelectionHandles()
})

clearButton.addEventListener("click", () => {
  editor.clear()
})

// Keyboard shortcuts for undo/redo
document.addEventListener("keydown", (e) => {
  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault()
    if (editor.undo()) {
      console.log("↩️ Undo successful")
    }
    return
  }

  // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
    e.preventDefault()
    if (editor.redo()) {
      console.log("↪️ Redo successful")
    }
    return
  }

  // Redo alternative: Ctrl+Y or Cmd+Y
  if ((e.ctrlKey || e.metaKey) && e.key === "y") {
    e.preventDefault()
    if (editor.redo()) {
      console.log("↪️ Redo successful")
    }
    return
  }
})

// Layer section
const getNodeItem = (nodeId) => {
  const node = editor.document.getNode(nodeId)
  if (!node) return null
  const li = document.createElement("li")
  const span = document.createElement("span")
  span.textContent =
    (node.type === "GROUP" ? "Group" : "Shape") + "-" + node.id.slice(0, 5)
  li.appendChild(span)

  const children = node.children.slice().reverse()
  const ul = document.createElement("ul")
  for (let child of children) {
    const listItem = getNodeItem(child)
    if (listItem) ul.appendChild(listItem)
  }
  if (ul.hasChildNodes()) li.appendChild(ul)

  return li
}

const renderLayerTree = () => {
  const parent = document.createElement("ul")
  const roots = editor.document.getRootNodes().slice().reverse()
  for (let root of roots) {
    const listItem = getNodeItem(root.id)
    if (listItem) parent.appendChild(listItem)
  }
  while (layersSection.firstChild) {
    layersSection.removeChild(layersSection.firstChild)
  }
  layersSection.appendChild(parent)
}

// Log editor state for debugging
console.log("📊 Editor state:", {
  canUndo: editor.canUndo(),
  canRedo: editor.canRedo(),
  tools: tools.map((t) => t.id),
  activeTool: editor.tools.getActive()?.id,
})
