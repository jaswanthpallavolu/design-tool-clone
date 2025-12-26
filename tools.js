import { clearCanvas } from "./canvas.js";
const clearButton = document.getElementById("clear");

// SELECT TOOL
const selectTool = document.querySelector(".selectTool");
const tools = [
  { id: "rectangle", name: "rectangle" },
  { id: "ellipse", name: "ellipse" },
  { id: "line", name: "line" },
  { id: "freehand", name: "freehand" },
];
let selectedTool = tools[0].id;

tools.forEach((tool) => {
  const option = document.createElement("option");
  option.value = tool.id;
  option.textContent = tool.name;
  selectTool.appendChild(option);
});

selectTool.addEventListener("change", (e) => {
  selectedTool = e.target.value;
});

// FILL COLOR INPUT
const fillColorInput = document.querySelector(".fillColorInput");
fillColorInput.value = "#FF4A2E";
let color = fillColorInput.value;

fillColorInput.addEventListener("input", (e) => {
  color = e.target.value;
});

// clearButton
clearButton.addEventListener("click", clearCanvas);
