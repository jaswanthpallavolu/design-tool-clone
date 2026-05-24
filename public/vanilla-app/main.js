import CanvasEventAdapter from "./CanvasEventAdapter.js"
import { LayerPanel } from "./LayerPanel.js"
const {
  Editor,
  CanvasRenderer,
  SelectTool,
  RectangleTool,
  EllipseTool,
  LineTool,
  UpdateShapesStyleCommand,
} = EditorEngine

// DOM elements
const toolDropdown = document.getElementById("tool-dropdown")
const colorInput = document.getElementById("color-input")
const clearButton = document.getElementById("clear-button")
const canvas = document.getElementById("canvas")
const layersSection = document.querySelector(".layers")

// Initialize editor with hybrid architecture (Command Pattern + Event Bus)
const editor = new Editor()

// Enable spatial indexing for fast hit testing and region queries
// editor.spatialIndex.enable({ cellSize: 100 })

console.log("✅ Editor initialized with Command Pattern and Event Bus")
console.log("📝 Undo/Redo available via Ctrl+Z / Ctrl+Shift+Z")
console.log("🗺️ Spatial indexing enabled for optimized performance")

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

// Listen for tool options changes (Editor → UI)
editor.on("tool:options:changed", (data) => {
  console.log("🎨 Tool options changed:", data)
  if (data && data.options && data.options.fillColor) {
    colorInput.value = data.options.fillColor
  }
})

// UI event handlers (UI → Editor via direct methods)
toolDropdown.addEventListener("change", (e) => {
  editor.setActiveTool(e.target.value)
})

colorInput.value = editor.getToolOption("fillColor")

colorInput.addEventListener("input", (e) => {
  const newColor = e.target.value

  // Update tool options for future shapes
  editor.updateToolOptions({
    strokeColor: newColor,
    fillColor: newColor,
  })

  // Update all currently selected shapes
  const selectedIds = editor.selection.getAll()
  if (selectedIds.length > 0) {
    // Filter to only get shape nodes (not groups)
    const shapeIds = selectedIds.filter((id) => editor.document.getShape(id))
    if (shapeIds.length > 0) {
      editor.commands.execute(
        new UpdateShapesStyleCommand(editor, shapeIds, {
          strokeColor: newColor,
          fillColor: newColor,
        }),
      )
    }
  }
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
