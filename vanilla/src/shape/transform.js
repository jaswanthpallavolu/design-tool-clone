import { state } from "../state.js";
import { getCanvasMouseInput, getLocalMouse } from "../utils/mouse.js";
import { redrawCanvas, redrawHandles } from "../canvas/renderer.js";
import { getShapePath, getShapeHandlesPath } from "./definitions.js";

function handleRotation(e) {
  if (state.interaction.mode !== "rotating") return;
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  let shape = { ...state.shapesById[state.selectedShapeId] };

  if (shape.type === "line") {
    // 2. Calculate the current distance from center to endpoints (radius)
    const dx = shape.p1.x - shape.center.x;
    const dy = shape.p1.y - shape.center.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    // 3. Calculate the new angle from mouse to center
    // Math.atan2(y, x)
    const angle = Math.atan2(mouseY - shape.center.y, mouseX - shape.center.x);

    // 4. Update P1 and P2 based on the new angle
    // P2 follows the mouse, P1 moves in the opposite direction (180 degrees away)
    shape.p2.x = shape.center.x + radius * Math.cos(angle);
    shape.p2.y = shape.center.y + radius * Math.sin(angle);

    shape.p1.x = shape.center.x - radius * Math.cos(angle);
    shape.p1.y = shape.center.y - radius * Math.sin(angle);
  } else {
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
  }

  shape = getShapePath(shape);
  state.handlePaths = getShapeHandlesPath(shape);
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  // Redraw the canvas
  redrawCanvas();
}

function handleDrag(e) {
  if (state.interaction.mode !== "dragging") return;
  const { mouseX, mouseY } = getCanvasMouseInput(e);
  let shape = { ...state.shapesById[state.selectedShapeId] };

  if (shape.type === "line") {
    // 1. Calculate new center based on mouse move
    const newCenterX = mouseX - state.interaction.offset.x;
    const newCenterY = mouseY - state.interaction.offset.y;

    // 2. Find the movement delta (dx/dy)
    const dx = newCenterX - shape.center.x;
    const dy = newCenterY - shape.center.y;

    // 3. Update World Coordinates
    shape.p1.x += dx;
    shape.p1.y += dy;
    shape.p2.x += dx;
    shape.p2.y += dy;
  } else {
    shape.p1.x = mouseX - state.interaction.offset.x;
    shape.p1.y = mouseY - state.interaction.offset.y;
  }
  shape = getShapePath(shape);
  state.handlePaths = getShapeHandlesPath(shape);
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  redrawCanvas();
}

function handleCornerResize(e) {
  if (
    state.interaction.mode !== "resizing" ||
    state.interaction.currentHandle.category !== "corner"
  )
    return;

  const { mouseX, mouseY } = getCanvasMouseInput(e);
  let shape = { ...state.shapesById[state.selectedShapeId] };
  const currentHandle = state.interaction.currentHandle.value;

  if (shape.type === "line") {
    if (currentHandle === "left") {
      shape.p1.x = mouseX;
      shape.p1.y = mouseY;
    } else if (currentHandle === "right") {
      shape.p2.x = mouseX;
      shape.p2.y = mouseY;
    }
  } else {
    const cos = Math.cos(shape.rotation);
    const sin = Math.sin(shape.rotation);

    // --- STEP 1: FIND THE PINNED ANCHOR (The Diagonal Vertex) ---
    // If we pull Top-Right (tr), the anchor is Bottom-Left (bl).
    let anchorLocalX, anchorLocalY;

    if (currentHandle === "br") {
      anchorLocalX = -shape.width / 2;
      anchorLocalY = -shape.height / 2;
    } // Anchor: tl
    if (currentHandle === "bl") {
      anchorLocalX = shape.width / 2;
      anchorLocalY = -shape.height / 2;
    } // Anchor: tr
    if (currentHandle === "tr") {
      anchorLocalX = -shape.width / 2;
      anchorLocalY = shape.height / 2;
    } // Anchor: bl
    if (currentHandle === "tl") {
      anchorLocalX = shape.width / 2;
      anchorLocalY = shape.height / 2;
    } // Anchor: br

    const centerX = shape.p1.x + shape.width / 2;
    const centerY = shape.p1.y + shape.height / 2;

    // Convert local anchor to world coordinates
    const pinnedX = centerX + anchorLocalX * cos - anchorLocalY * sin;
    const pinnedY = centerY + anchorLocalX * sin + anchorLocalY * cos;

    // --- STEP 2: CALCULATE NEW DIMENSIONS ---
    const localMouse = getLocalMouse(mouseX, mouseY, shape);
    const oldW = shape.width;
    const oldH = shape.height;

    if (currentHandle.includes("r")) shape.width = localMouse.x + oldW / 2;
    else shape.width = oldW / 2 - localMouse.x;

    if (currentHandle.includes("b")) shape.height = localMouse.y + oldH / 2;
    else shape.height = oldH / 2 - localMouse.y;

    // Clamp minimum size
    shape.width = Math.max(5, shape.width);
    shape.height = Math.max(5, shape.height);

    // --- STEP 3: RE-ALIGN TO THE PINNED ANCHOR ---
    // The center has moved because width/height changed.
    // We find where the anchor is NOW and shift p1 by the difference.
    const newCenterX = shape.p1.x + shape.width / 2;
    const newCenterY = shape.p1.y + shape.height / 2;

    // Recalculate local anchor position with NEW dimensions
    let newAnchorLocalX, newAnchorLocalY;
    if (currentHandle === "br") {
      newAnchorLocalX = -shape.width / 2;
      newAnchorLocalY = -shape.height / 2;
    }
    if (currentHandle === "bl") {
      newAnchorLocalX = shape.width / 2;
      newAnchorLocalY = -shape.height / 2;
    }
    if (currentHandle === "tr") {
      newAnchorLocalX = -shape.width / 2;
      newAnchorLocalY = shape.height / 2;
    }
    if (currentHandle === "tl") {
      newAnchorLocalX = shape.width / 2;
      newAnchorLocalY = shape.height / 2;
    }

    const currentAnchorX =
      newCenterX + newAnchorLocalX * cos - newAnchorLocalY * sin;
    const currentAnchorY =
      newCenterY + newAnchorLocalX * sin + newAnchorLocalY * cos;

    // Apply the correction shift
    shape.p1.x += pinnedX - currentAnchorX;
    shape.p1.y += pinnedY - currentAnchorY;
  }

  shape = getShapePath(shape);
  state.handlePaths = getShapeHandlesPath(shape);
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  redrawCanvas();
}

function handleEdgeResize(e) {
  if (
    state.interaction.mode !== "resizing" ||
    state.interaction.currentHandle.category !== "edge"
  )
    return; // Ignore if not a side/corner

  const { mouseX, mouseY } = getCanvasMouseInput(e);
  let shape = { ...state.shapesById[state.selectedShapeId] };
  const currentHandle = state.interaction.currentHandle.value;

  const cos = Math.cos(shape.rotation);
  const sin = Math.sin(shape.rotation);

  // --- STEP 1: DEFINE THE PINNED ANCHOR ---
  // We identify the local coordinate of the point that must stay fixed.
  // If we pull the Right side, the Left side (-width/2) is the anchor.
  let anchorLocalX = 0;
  let anchorLocalY = 0;

  if (currentHandle === "right") anchorLocalX = -shape.width / 2;
  if (currentHandle === "left") anchorLocalX = shape.width / 2;
  if (currentHandle === "bottom") anchorLocalY = -shape.height / 2;
  if (currentHandle === "top") anchorLocalY = shape.height / 2;

  const centerX = shape.p1.x + shape.width / 2;
  const centerY = shape.p1.y + shape.height / 2;

  // Convert that local anchor point to World Coordinates
  const pinnedX = centerX + anchorLocalX * cos - anchorLocalY * sin;
  const pinnedY = centerY + anchorLocalX * sin + anchorLocalY * cos;

  // --- STEP 2: CALCULATE NEW SIZE ---
  const localMouse = getLocalMouse(mouseX, mouseY, shape);
  const oldW = shape.width;
  const oldH = shape.height;

  // Only update the axis associated with the handle
  if (currentHandle === "right") shape.width = localMouse.x + oldW / 2;
  if (currentHandle === "left") shape.width = oldW / 2 - localMouse.x;
  if (currentHandle === "bottom") shape.height = localMouse.y + oldH / 2;
  if (currentHandle === "top") shape.height = oldH / 2 - localMouse.y;

  // Clamp minimum size for 2025 stability
  shape.width = Math.max(5, shape.width);
  shape.height = Math.max(5, shape.height);

  // --- STEP 3: REALIGN TO THE PINNED ANCHOR ---
  const newCenterX = shape.p1.x + shape.width / 2;
  const newCenterY = shape.p1.y + shape.height / 2;

  // Recalculate where that anchor is NOW with the new dimensions
  let newAnchorLocalX = 0;
  let newAnchorLocalY = 0;

  if (currentHandle === "right") newAnchorLocalX = -shape.width / 2;
  if (currentHandle === "left") newAnchorLocalX = shape.width / 2;
  if (currentHandle === "bottom") newAnchorLocalY = -shape.height / 2;
  if (currentHandle === "top") newAnchorLocalY = shape.height / 2;

  const currentAnchorX =
    newCenterX + newAnchorLocalX * cos - newAnchorLocalY * sin;
  const currentAnchorY =
    newCenterY + newAnchorLocalX * sin + newAnchorLocalY * cos;

  // Apply the correction shift to the base position p1
  shape.p1.x += pinnedX - currentAnchorX;
  shape.p1.y += pinnedY - currentAnchorY;

  shape = getShapePath(shape);
  state.handlePaths = getShapeHandlesPath(shape);
  state.shapesById = {
    ...state.shapesById,
    [shape.id]: shape,
  };

  redrawCanvas();
}

function resetInteraction() {
  state.interaction.mode = "none";
  //   state.interaction.offset = { x: 0, y: 0 };
  redrawHandles();
}

export {
  handleRotation,
  handleDrag,
  resetInteraction,
  handleCornerResize,
  handleEdgeResize,
};
