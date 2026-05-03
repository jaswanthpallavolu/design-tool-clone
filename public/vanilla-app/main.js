import CanvasEventAdapter from "./CanvasEventAdapter.js"
import { LayerPanel } from "./LayerPanel.js"
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

new LayerPanel(editor, layersSection)

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
