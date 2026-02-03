import { state } from "../state.js";
import {
  ctx,
  canvas,
  drawShape,
  drawShapeHandles,
  redrawCanvas,
} from "../canvas/renderer.js";
import { getCanvasMouseInput } from "../utils/mouse.js";
import {
  getRectangleObject,
  getShapeHandlesPath,
  getEllipseObject,
  getLineObject,
} from "../shape/definitions.js";

function startDrawing(e) {
  if (state.interaction.mode !== "none") return;
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  state.interaction.mode = "drawing";
  state.interaction.origin = { x: mouseX, y: mouseY };
  //   ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(mouseX, mouseY);
  ctx.fillStyle = state.selectedTool.fillColor;
  ctx.strokeStyle = state.selectedTool.strokeColor;
  state.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function updateDrawing(e) {
  if (state.interaction.mode !== "drawing") return;
  ctx.putImageData(state.imageData, 0, 0);
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  const origin = state.interaction.origin;
  const width = mouseX - origin.x;
  const height = mouseY - origin.y;

  let shape;
  switch (state.selectedTool.id) {
    case "rectangle":
      ctx.beginPath();
      shape = getRectangleObject({
        x: origin.x,
        y: origin.y,
        width,
        height,
      });
      break;
    case "ellipse":
      ctx.beginPath();
      shape = getEllipseObject({
        x: origin.x,
        y: origin.y,
        width,
        height,
      });
      break;
    case "line":
      ctx.beginPath();
      shape = getLineObject(
        { x: origin.x, y: origin.y },
        { x: mouseX, y: mouseY },
      );
      break;
    default:
      ctx.beginPath();
      shape = getRectangleObject({
        x: origin.x,
        y: origin.y,
        width,
        height,
      });
      shape.type = "marquee";
  }
  state.selectedShapeId = shape.id;
  state.handlePaths = getShapeHandlesPath(shape);
  state.currentShape = shape;
  drawShape(shape);
  if (shape.type !== "marquee") {
    drawShapeHandles(shape, state.handlePaths);
  }
}

function stopDrawing() {
  ctx.closePath();
  if (state.currentShape.type !== "marquee") {
    const shape = state.currentShape;
    state.shapesById = { ...state.shapesById, [shape.id]: shape };
    redrawCanvas();
  } else if (state.currentShape.type === "marquee") {
    // TODO AABB
  }
  state.currentShape = null;
}

export { startDrawing, updateDrawing, stopDrawing };
