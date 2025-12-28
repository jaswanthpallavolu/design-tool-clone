import { state } from "../state.js";
import { getCanvasMouseInput } from "../utils/mouse.js";
import { redrawCanvas, redrawHandles } from "../canvas/renderer.js";
import { getRectanglePath, getRectangleHandlesPath } from "./definitions.js";

function handleRotation(e) {
  if (state.interaction.mode !== "rotating" || !state.selectedShapeId) return;
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  const shape = { ...state.shapesById[state.selectedShapeId] };

  // 1. Calculate current mouse angle
  const currentAngle = Math.atan2(
    mouseY - shape.center.y,
    mouseX - shape.center.x
  );

  // 2. The new rotation is: (Initial Rotation) + (Change in Mouse Angle)
  let newRotation =
    state.transform.initialRotation +
    (currentAngle - state.transform.startAngle);

  // 3. Optional: Figma-style snapping (Hold Shift to snap to 15-degree increments)
  //   if (e.shiftKey) {
  //     const snap = Math.PI / 12; // 15 degrees in radians
  //     newRotation = Math.round(newRotation / snap) * snap;
  //   }
  shape.rotation = newRotation;
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  // Redraw the canvas
  redrawCanvas();
}

function handleDrag(e) {
  if (state.interaction.mode !== "dragging" || !state.selectedShapeId) return;
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  let shape = { ...state.shapesById[state.selectedShapeId] };

  shape.p1.x = mouseX - state.interaction.offset.x;
  shape.p1.y = mouseY - state.interaction.offset.y;
  shape = getRectanglePath(shape);
  state.handlePaths = getRectangleHandlesPath({}, shape);
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  redrawCanvas();
}

function resetInteraction() {
  state.interaction.mode = "none";
  state.interaction.offset = { x: 0, y: 0 };
  redrawHandles();
}

export { handleRotation, handleDrag, resetInteraction };
