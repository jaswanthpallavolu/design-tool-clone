import { state } from "../state.js";
import {
  ctx,
  drawHoverOutline,
  resetCanvas,
  drawShapeHandles,
} from "../canvas/renderer.js";
import { getCanvasMouseInput } from "../utils/mouse.js";
import { getRectangleHandlesPath } from "./definitions.js";

const detectShape = (ctx, { mouseX, mouseY }, shape) => {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  const hitfound = ctx.isPointInPath(shape.path, mouseX, mouseY);
  ctx.restore();
  return hitfound;
};

function checkHandlesPathHit(
  ctx,
  paths = {},
  { mouseX, mouseY },
  stroke = false
) {
  // Increase lineWidth temporarily for a larger 'grab' area
  ctx.lineWidth = 10;

  for (const [side, path] of Object.entries(paths)) {
    if (
      stroke
        ? ctx.isPointInStroke(path, mouseX, mouseY)
        : ctx.isPointInPath(path, mouseX, mouseY)
    ) {
      return side;
    }
  }
  return null;
}

function detectShapeHandle(ctx, mouseInput, shape) {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  const hit1 = checkHandlesPathHit(
    ctx,
    state.handlePaths.cornerPaths,
    mouseInput
  );
  const hit2 = checkHandlesPathHit(
    ctx,
    state.handlePaths.rotatePaths,
    mouseInput
  );
  const hit3 = checkHandlesPathHit(
    ctx,
    state.handlePaths.edgePaths,
    mouseInput,
    true
  );

  if (hit1) console.log("checkCornerHit ", hit1);
  else if (hit2) console.log("checkRotationHit ", hit2);
  else if (hit3) console.log("checkEdgeHit ", hit3);
  ctx.restore();
  return { rotate: hit2, resize: hit1 || hit3 };
}

function handleShapeHandles(e) {
  if (!state.selectedShapeId) return;
  const shape = state.shapesById[state.selectedShapeId];
  const mouseInput = getCanvasMouseInput(e);
  detectShapeHandle(ctx, mouseInput, shape);
}

function handleShapeDetection(e) {
  if (state.selectedShapeId) return;
  const mouseInput = getCanvasMouseInput(e);
  let shapeDetected = false;
  for (let shape of Object.values(state.shapesById)) {
    if (detectShape(ctx, mouseInput, shape)) {
      drawHoverOutline(shape);
      state.hoveredShapeId = shape.id;
      shapeDetected = true;
      break;
    }
  }
  if (!shapeDetected) resetCanvas();
}

function handleShapeSelection(e) {
  const mouseInput = getCanvasMouseInput(e);
  let shapeDetected = false;
  for (let shape of Object.values(state.shapesById)) {
    if (detectShape(ctx, mouseInput, shape)) {
      state.selectedShapeId = shape.id;
      state.handlePaths = getRectangleHandlesPath(ctx, shape);
      drawShapeHandles(shape, state.handlePaths);
      shapeDetected = true;
      break;
    }
  }
  if (!shapeDetected) resetCanvas();
}

export { handleShapeDetection, handleShapeSelection, handleShapeHandles };
