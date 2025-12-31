import { clearCanvas } from "../canvas/renderer.js";
import { state } from "../state.js";
const selectTool = document.querySelector(".selectTool");
const fillColorInput = document.querySelector(".fillColorInput");
const clearButton = document.getElementById("clear");
const tools = [
  { id: "rectangle", name: "rectangle" },
  { id: "ellipse", name: "ellipse" },
  { id: "line", name: "line" },
  // { id: "freehand", name: "freehand" },
];

const init = () => {
  selectTool.value = state.selectedTool.id;
  fillColorInput.value = state.selectedTool.color;
};

tools.forEach((tool) => {
  const option = document.createElement("option");
  option.value = tool.id;
  option.textContent = tool.name;
  selectTool.appendChild(option);
});

// SELECT TOOL
selectTool.addEventListener("change", (e) => {
  state.selectedTool.id = e.target.value;
});

// FILL COLOR INPUT
fillColorInput.addEventListener("input", (e) => {
  state.selectedTool.color = e.target.value;
});

// clearButton
clearButton.addEventListener("click", clearCanvas);

export { init };
