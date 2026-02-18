import { clearCanvas } from "../canvas/renderer.js"
import { state } from "../state.js"
const selectTool = document.querySelector(".selectTool")
const fillColorInput = document.querySelector(".fillColorInput")
const clearButton = document.getElementById("clear")

const tools = [
  { id: "move", name: "move" },
  { id: "rectangle", name: "rectangle" },
  { id: "ellipse", name: "ellipse" },
  { id: "line", name: "line" },
]

const init = () => {
  selectTool.value = state.selectedTool.id
  fillColorInput.value = state.selectedTool.fillColor
}

tools.forEach((tool) => {
  const option = document.createElement("option")
  option.value = tool.id
  option.textContent = tool.name
  selectTool.appendChild(option)
})

const handleColorInputChange = (tool) => {
  if (tool === "move") {
    state.selectedTool.fillColor = "#0D99FF1A"
    state.selectedTool.strokeColor = "#0D99FF"
  } else {
    state.selectedTool.fillColor = fillColorInput.value
    state.selectedTool.strokeColor = fillColorInput.value
  }
}

// SELECT TOOL
selectTool.addEventListener("change", (e) => {
  state.selectedTool.id = e.target.value
  handleColorInputChange(e.target.value)
})

// FILL COLOR INPUT
fillColorInput.addEventListener("input", (e) => {
  handleColorInputChange(state.selectedTool.id)
})

// clearButton
clearButton.addEventListener("click", clearCanvas)

function handleToolSelection(e) {
  const shortcutKeys = {
    v: "move",
    r: "rectangle",
    o: "ellipse",
    l: "line",
  }
  const tool = shortcutKeys?.[e.key]
  if (tool) {
    selectTool.value = tool
    state.selectedTool.id = tool
    handleColorInputChange(tool)
  }
}

export { init, handleToolSelection }
