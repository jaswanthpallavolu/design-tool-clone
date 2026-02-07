import { init as initUI, handleToolSelection } from "./ui/toolbar.js";
import { init as initCanvas, canvas, redrawCanvas } from "./canvas/renderer.js";
import { initViewport } from "./canvas/viewport.js";
import {
  handleShapeDetection,
  handleCanvasMouseDown,
} from "./shape/hit-test.js";
import {
  handleRotation,
  handleDrag,
  resetInteraction,
  handleCornerResize,
  handleEdgeResize,
} from "./shape/transform.js";
import { updateDrawing, stopDrawing } from "./tool/draw-tool.js";
import { deleteShape } from "./shape/actions.js";

initUI();
initCanvas();
initViewport(canvas, redrawCanvas);

canvas.addEventListener("mousemove", handleShapeDetection);

canvas.addEventListener("mousedown", handleCanvasMouseDown);
// canvas.addEventListener("mousedown", handleShapeSelection);
// canvas.addEventListener("mousedown", handleShapeHandles);
// canvas.addEventListener("mousedown", startDrawing);

canvas.addEventListener("mousemove", handleRotation);
canvas.addEventListener("mousemove", handleDrag);
canvas.addEventListener("mousemove", handleCornerResize);
canvas.addEventListener("mousemove", handleEdgeResize);
canvas.addEventListener("mouseup", resetInteraction);

canvas.addEventListener("mousemove", updateDrawing);
canvas.addEventListener("mouseup", stopDrawing);

window.addEventListener("keydown", deleteShape);
window.addEventListener("keydown", handleToolSelection);
