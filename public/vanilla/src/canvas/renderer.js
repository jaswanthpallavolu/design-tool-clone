import { state } from "../state.js";
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d", { willReadFrequently: true });

function init() {
  // state.shapesById = shapes;
  redrawCanvas();
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let shape of Object.values(state.shapesById)) {
    drawShape(shape);
  }
  state.canvas.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  redrawHandles();
}

function redrawHandles() {
  if (state.canvas.imageData) ctx.putImageData(state.canvas.imageData, 0, 0);
  Array.from(state.selectedShapes).forEach((shapeId) => {
    drawShapeHandles(state.shapesById[shapeId], state.handlePaths);
  });
  if (state.hoveredShapeId)
    drawHoverOutline(state.shapesById[state.hoveredShapeId]);
  // for (let shape of Object.values(state.shapesById)) {
  //   if (
  //     state.selectedShapes.has(shape.id) &&
  //     state.interaction.mode !== "dragging"
  //   )
  //     drawShapeHandles(shape, state.handlePaths);
  //   // else if (
  //   //   shape.id === state.selectedShapeId &&
  //   //   state.interaction.mode === "dragging"
  //   // )
  //   //   drawHoverOutline(shape);
  // }
}

function drawShape(shape) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  ctx.fillStyle = shape.fillStyle;
  ctx.strokeStyle = shape.strokeStyle;
  if (shape.type === "line") {
    ctx.lineWidth = shape.lineWidth;
    ctx.stroke(shape.path);
  } else {
    ctx.stroke(shape.path);
    ctx.fill(shape.path);
  }
  ctx.restore();
}

function drawHoverOutline(shape) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  ctx.lineWidth = 2;
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
  // state.hoveredShapeId = null;
  // state.selectedShapes.clear();
  ctx.putImageData(state.canvas.imageData, 0, 0);
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.shapesById = {};
  state.canvas.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
  redrawHandles,
  drawShape,
};
