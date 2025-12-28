import { state } from "./state.js";
import { init as initUI } from "./ui/toolbar.js";
import { init as initCanvas, canvas, redrawCanvas } from "./canvas/renderer.js";
import { initViewport } from "./canvas/viewport.js";
import {
  handleShapeDetection,
  handleShapeSelection,
  handleShapeHandles,
} from "./shape/hit-test.js";

initUI();
initCanvas();
initViewport(canvas, redrawCanvas);

canvas.addEventListener("mousemove", handleShapeDetection);
canvas.addEventListener("mouseup", handleShapeSelection);
canvas.addEventListener("mousedown", handleShapeHandles);
