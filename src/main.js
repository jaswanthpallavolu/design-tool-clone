import { init as initUI } from "./ui/toolbar.js";
import { init as initCanvas, canvas, redrawCanvas } from "./canvas/renderer.js";
import { initViewport } from "./canvas/viewport.js";
import {
  handleShapeDetection,
  handleShapeSelection,
  handleShapeHandles,
} from "./shape/hit-test.js";
import {
  handleRotation,
  handleDrag,
  resetInteraction,
  handleCornerResize,
  handleEdgeResize,
} from "./shape/transform.js";
import { startDrawing, updateDrawing, stopDrawing } from "./tool/draw-tool.js";

initUI();
initCanvas();
initViewport(canvas, redrawCanvas);

canvas.addEventListener("mousemove", handleShapeDetection);
canvas.addEventListener("mousedown", handleShapeSelection);
canvas.addEventListener("mousedown", handleShapeHandles);

canvas.addEventListener("mousemove", handleRotation);
canvas.addEventListener("mousemove", handleDrag);
canvas.addEventListener("mousemove", handleCornerResize);
canvas.addEventListener("mousemove", handleEdgeResize);
canvas.addEventListener("mouseup", resetInteraction);

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", updateDrawing);
canvas.addEventListener("mouseup", stopDrawing);
