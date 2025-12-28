import { state } from "../state.js";
import { getRectangleObject } from "../shape/definitions.js";
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d", { willReadFrequently: true });

function init() {
  let shape = getRectangleObject({
    x: 100,
    y: 100,
    width: 200,
    height: 100,
  });
  state.shapesById = { ...state.shapesById, [shape.id]: shape };
  redrawCanvas();
}

function redrawCanvas() {
  clearCanvas();
  for (let shape of Object.values(state.shapesById)) {
    drawShape(shape);
    // if (shape.isSelected) shapeHandlesPath = drawShapeHandles(ctx, shape);
  }
  state.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function drawShape(shape) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  ctx.fillStyle = shape.fillStyle;
  ctx.fill(shape.path);
  ctx.restore();
}

function drawHoverOutline(shape) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  ctx.strokeStyle = "#00aaff";
  ctx.stroke(shape.path);
  ctx.restore();
}

function drawShapeHandles(shape, handlePaths) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);

  const { cornerPaths, edgePaths, rotatePaths } = handlePaths;

  ctx.strokeStyle = "#00aaff";
  Object.values(edgePaths).forEach((path) => {
    ctx.stroke(path);
  });

  ctx.strokeStyle = "#00aaff";
  ctx.fillStyle = "white";
  Object.values(cornerPaths).forEach((path) => {
    ctx.fill(path);
    ctx.stroke(path);
  });

  ctx.strokeStyle = "blue";
  Object.values(rotatePaths).forEach((path) => {
    ctx.stroke(path);
  });

  ctx.restore();
}

function resetCanvas() {
  state.hoveredShapeId = null;
  state.selectedShapeId = null;
  ctx.putImageData(state.imageData, 0, 0);
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export {
  ctx,
  canvas,
  init,
  clearCanvas,
  redrawCanvas,
  drawHoverOutline,
  resetCanvas,
  drawShapeHandles,
};
