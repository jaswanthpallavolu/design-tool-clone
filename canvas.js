import { drawShape, drawShapeHandles, detectShapeHandles } from "./shape.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let boundRect;
let imageData;

ctx.fillStyle = "#FF4A2E";

let shape = {};
let shapePath;
let shapeHandlesPath;

// rotation logic
let isRotating = false;
let isResizing = false;
let startAngle = 0;
let initialRotation = 0;
let currentHandle;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const init = () => {
  boundRect = canvas.getBoundingClientRect();
  shape = {
    p1: {},
    p2: {},
    type: "rectangle",
    width: 0,
    height: 0,
    rotation: 0,
    isSelected: false,
    fillStyle: "#FF4A2E",
  };
  shape.p1 = { x: 200, y: 200 };
  shape.width = 200;
  shape.height = 100;
  redrawCanvas();
};

function redrawCanvas() {
  clearCanvas();
  shapePath = drawShape(ctx, shape);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (shape.isSelected) shapeHandlesPath = drawShapeHandles(ctx, shape);
}

const detectShape = (e) => {
  const x = e.clientX - boundRect.left;
  const y = e.clientY - boundRect.top;

  if (shape.isSelected) {
    // detectShapeHandles(ctx, { ...shape, ...shapeHandlesPath }, x, y);
    return;
  }
  ctx.save();
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  ctx.rotate(shape.rotation);
  const hitfound = ctx.isPointInPath(shapePath, x, y);

  // ctx.save();

  if (hitfound) {
    ctx.strokeStyle = "#00aaff";
    // ctx.lineWidth = 2;
    // ctx.setLineDash([5, 5]);
    // ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
    // ctx.rotate(shape.rotation);
    ctx.stroke(shapePath);
    ctx.restore();
    // ctx.restore();
  } else {
    ctx.putImageData(imageData, 0, 0);
    // ctx.fillStyle = "#FF4A2E";
    // ctx.fill(shapePath);
  }
  ctx.restore();
};

const selectShape = (e) => {
  const x = e.clientX - boundRect.left;
  const y = e.clientY - boundRect.top;

  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  ctx.save();
  ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  ctx.rotate(shape.rotation);
  const hitfound = ctx.isPointInPath(shapePath, x, y);
  ctx.restore();

  if (hitfound) {
    shape.isSelected = true;
    ctx.putImageData(imageData, 0, 0);
    shapeHandlesPath = drawShapeHandles(ctx, shape);
  } else {
    shape.isSelected = false;
    ctx.putImageData(imageData, 0, 0);
  }
};

canvas.addEventListener("mousemove", detectShape);

canvas.addEventListener("mousedown", (e) => {
  if (!shape.isSelected) return;
  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

  const { cornerPaths, edgePaths, rotatePaths } = shapeHandlesPath;
  const { rotate, resize } = detectShapeHandles(
    ctx,
    { ...shape, ...shapeHandlesPath },
    mouseX,
    mouseY
  );

  if (Object.keys(rotatePaths).find((e) => e === rotate)) {
    isRotating = true;
    isResizing = false;

    // 2. Calculate the "Starting Angle" of the mouse relative to center
    const centerX = shape.p1.x + shape.width / 2;
    const centerY = shape.p1.y + shape.height / 2;

    // This is where the mouse is right now
    startAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // Save the shape's current rotation
    initialRotation = shape.rotation;
  } else if (
    Object.keys(cornerPaths).find((e) => e === resize) ||
    Object.keys(edgePaths).find((e) => e === resize)
  ) {
    isRotating = false;
    isResizing = true;
    currentHandle = resize;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isRotating) return;

  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const centerX = shape.p1.x + shape.width / 2;
  const centerY = shape.p1.y + shape.height / 2;

  // 1. Calculate current mouse angle
  const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

  // 2. The new rotation is: (Initial Rotation) + (Change in Mouse Angle)
  let newRotation = initialRotation + (currentAngle - startAngle);

  // 3. Optional: Figma-style snapping (Hold Shift to snap to 15-degree increments)
  if (e.shiftKey) {
    const snap = Math.PI / 12; // 15 degrees in radians
    newRotation = Math.round(newRotation / snap) * snap;
  }

  shape.rotation = newRotation;

  // Redraw the canvas
  redrawCanvas();
});
// End of rotation logic

function getLocalMouse(mouseX, mouseY, shape) {
  const cx = shape.p1.x + shape.width / 2;
  const cy = shape.p1.y + shape.height / 2;

  // 1. Get mouse relative to center
  const dx = mouseX - cx;
  const dy = mouseY - cy;

  // 2. Rotate the point by the NEGATIVE of the shape's rotation
  const cos = Math.cos(-shape.rotation);
  const sin = Math.sin(-shape.rotation);

  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos,
  };
}

// Corner resizing
canvas.addEventListener("mousemove", (e) => {
  if (!isResizing || currentHandle.length !== 2) return;

  const boundRect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

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

  redrawCanvas();
});

// Edge resizing
canvas.addEventListener("mousemove", (e) => {
  if (!isResizing || currentHandle.length <= 2) return; // Ignore if not a side/corner

  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

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

  redrawCanvas();
});

// Dragging
canvas.addEventListener("mousedown", (e) => {
  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

  // 1. Check if we hit the main shape body
  // (Assuming 'shapePath' is the Path2D returned by your drawShape function)
  ctx.save();
  ctx.translate(shape.p1.x + shape.width / 2, shape.p1.y + shape.height / 2);
  ctx.rotate(shape.rotation);

  const isHit = ctx.isPointInPath(shapePath, mouseX, mouseY);
  ctx.restore();

  // 2. If it's a hit and NOT a resize/rotate handle, start dragging
  if (isHit && !isResizing && !isRotating) {
    isDragging = true;

    // Store the distance from the mouse to the shape's p1
    dragOffset.x = mouseX - shape.p1.x;
    dragOffset.y = mouseY - shape.p1.y;
  }
});
canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  shape.isSelected = false;
  ctx.putImageData(imageData, 0, 0);

  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

  // Update the position
  shape.p1.x = mouseX - dragOffset.x;
  shape.p1.y = mouseY - dragOffset.y;

  redrawCanvas();
});

window.addEventListener("mouseup", (e) => {
  if (!(isRotating || isResizing)) selectShape(e);
  isRotating = false;
  isResizing = false;
  isDragging = false;
});

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export { canvas, ctx, clearCanvas, init };
