import CanvasEventAdapter from "./CanvasEventAdapter.js"
import { LayerPanel } from "./LayerPanel.js"
import { ShortcutsModal } from "./ShortcutsModal.js"
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
const layersSection = document.querySelector(".layers-content")

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

editor.on("selection:changed", () => {
  renderer.clearSelectionBox()
  renderer.renderSelectionBox()
  renderer.renderSelectionHandles()
})

editor.on("hover:changed", () => {
  renderer.clearSelectionBox()
  renderer.renderSelectionBox()
  renderer.renderSelectionHandles()
  renderer.renderHoverOutline()
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
    // Collect all shape IDs including descendants of selected groups
    const shapeIds = []
    for (const id of selectedIds) {
      const node = editor.document.getNode(id)
      if (!node) continue

      // If it's a shape, add it directly
      if (editor.document.getShape(id)) {
        shapeIds.push(id)
      } else if (node.type === "GROUP") {
        // If it's a group, collect all descendant shapes
        const descendantShapes = getDescendantShapeIds(id, editor)
        shapeIds.push(...descendantShapes)
      }
    }

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

// Helper function to get all descendant shape IDs from a node (recursively for groups)
function getDescendantShapeIds(nodeId, editor) {
  const result = []
  const stack = [nodeId]

  while (stack.length > 0) {
    const currentId = stack.pop()
    const node = editor.document.getNode(currentId)
    if (!node) continue

    if (node.type === "GROUP") {
      // Add children to stack (in reverse to maintain order)
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i])
      }
    } else if (editor.document.getShape(currentId)) {
      result.push(currentId)
    }
  }

  return result
}

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

// Initialize Keyboard Shortcuts Modal
new ShortcutsModal()
