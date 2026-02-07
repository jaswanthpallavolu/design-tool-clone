import { state } from "../state.js";
import {
  ctx,
  drawHoverOutline,
  resetCanvas,
  redrawCanvas,
  redrawHandles,
} from "../canvas/renderer.js";
import { getCanvasMouseInput } from "../utils/mouse.js";
import { getShapeHandlesPath } from "./definitions.js";
import { startDrawing } from "../tool/draw-tool.js";

const detectShape = (ctx, { mouseX, mouseY }, shape) => {
  ctx.save();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.rotation);
  ctx.lineWidth = 10;
  const hitfound =
    shape.type === "line"
      ? ctx.isPointInStroke(shape.path, mouseX, mouseY)
      : ctx.isPointInPath(shape.path, mouseX, mouseY);
  ctx.restore();

  return hitfound;
};

function checkHandlesPathHit(
  ctx,
  paths = {},
  { mouseX, mouseY },
  stroke = false,
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
  const cornerHit = checkHandlesPathHit(
    ctx,
    state.handlePaths.cornerPaths,
    mouseInput,
  );
  const rotateHit = checkHandlesPathHit(
    ctx,
    state.handlePaths.rotatePaths,
    mouseInput,
  );
  const edgeHit = checkHandlesPathHit(
    ctx,
    state.handlePaths.edgePaths,
    mouseInput,
    true,
  );
  const result = {};
  if (cornerHit) {
    result.category = "corner";
    result.value = cornerHit;
  } else if (rotateHit) {
    result.category = "rotate";
    result.value = rotateHit;
  } else if (edgeHit) {
    result.category = "edge";
    result.value = edgeHit;
  }
  ctx.restore();
  return result;
}

function handleShapeHandles(e) {
  if (!state.selectedShapeId || state.interaction.mode !== "none") return;
  const shape = state.shapesById[state.selectedShapeId];
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  const currentHandle = detectShapeHandle(ctx, { mouseX, mouseY }, shape);
  state.interaction.currentHandle = currentHandle;
  if (currentHandle.category === "rotate") {
    state.interaction.mode = "rotating";

    // This is where the mouse is right now
    state.transform.startAngle = Math.atan2(
      mouseY - shape.center.y,
      mouseX - shape.center.x,
    );

    // Save the shape's current rotation
    state.transform.initialRotation = shape.rotation;
  } else if (["edge", "corner"].includes(currentHandle.category)) {
    state.interaction.mode = "resizing";
  } else {
    state.interaction.mode = "dragging";
    if (shape.type === "line") {
      // CRITICAL: Calculate the distance from the mouse to the center
      state.interaction.offset = {
        x: mouseX - shape.center.x,
        y: mouseY - shape.center.y,
      };
    } else {
      state.interaction.offset.x = mouseX - shape.p1.x;
      state.interaction.offset.y = mouseY - shape.p1.y;
    }
  }
}

function handleShapeDetection(e) {
  if (state.selectedTool.id !== "move") return;
  const mouseInput = getCanvasMouseInput(e);
  const hoveredShape = state.shapesById?.[state.hoveredShapeId];
  if (hoveredShape && detectShape(ctx, mouseInput, hoveredShape)) return;
  state.hoveredShapeId = null;
  // resetCanvas();
  for (let shape of Object.values(state.shapesById)) {
    if (detectShape(ctx, mouseInput, shape)) {
      // drawHoverOutline(shape);
      state.hoveredShapeId = shape.id;
      break;
    }
  }
  redrawHandles();
}

function isShapeSelected(e) {
  if (state.selectedTool.id !== "move") return false;
  const mouseInput = getCanvasMouseInput(e);
  let shapeDetected = false;
  state.selectedShapes.clear();
  for (let shape of Object.values(state.shapesById)) {
    // detectShapeHandle(ctx, mouseInput, shape)?.value
    if (detectShape(ctx, mouseInput, shape)) {
      if (!state.selectedShapes.has(shape.id)) {
        state.selectedShapes.add(shape.id);
        state.handlePaths = getShapeHandlesPath(shape);
        redrawCanvas();
      }
      shapeDetected = true;
      break;
    }
  }
  if (!shapeDetected) {
    state.selectedShapes.clear();
  }
  redrawHandles();
  return shapeDetected;
}

function handleCanvasMouseDown(e) {
  if (isShapeSelected(e)) return;
  startDrawing(e);
}

export { handleShapeDetection, handleShapeHandles, handleCanvasMouseDown };
