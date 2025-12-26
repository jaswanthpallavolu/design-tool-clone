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
  if (isRotating) return;
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
canvas.addEventListener("click", selectShape);

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

window.addEventListener("mouseup", () => {
  isRotating = false;
  isResizing = false;
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

canvas.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  // 1. Get Mouse relative to Canvas using 2025 standard clientX/Y
  const boundRect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - boundRect.left;
  const mouseY = e.clientY - boundRect.top;

  // 2. Get mouse in "Un-rotated" local space relative to center
  const localMouse = getLocalMouse(mouseX, mouseY, shape);

  const oldW = shape.width;
  const oldH = shape.height;

  // 3. Update Width (Right/Left handles)
  if (currentHandle.includes("r") || currentHandle === "right") {
    shape.width = localMouse.x + oldW / 2;
  } else if (currentHandle.includes("l") || currentHandle === "left") {
    shape.width = oldW / 2 - localMouse.x;
  }

  // 4. Update Height (Top/Bottom handles)
  if (currentHandle.includes("b") || currentHandle === "bottom") {
    shape.height = localMouse.y + oldH / 2;
  } else if (currentHandle.includes("t") || currentHandle === "top") {
    shape.height = oldH / 2 - localMouse.y;
  }

  // 5. Minimum Size Clamp
  shape.width = Math.max(5, shape.width);
  shape.height = Math.max(5, shape.height);

  // 6. POSITION COMPENSATION (The Pivot Logic)
  // Calculate how much the size changed
  const dw = shape.width - oldW;
  const dh = shape.height - oldH;

  let localDX = 0;
  let localDY = 0;

  // Determine local center shift based on which handle was pulled
  if (currentHandle.includes("r") || currentHandle === "right")
    localDX += dw / 2;
  if (currentHandle.includes("l") || currentHandle === "left")
    localDX -= dw / 2;
  if (currentHandle.includes("b") || currentHandle === "bottom")
    localDY += dh / 2;
  if (currentHandle.includes("t") || currentHandle === "top") localDY -= dh / 2;

  // 7. Rotate the local shift back to World Space
  const cos = Math.cos(shape.rotation);
  const sin = Math.sin(shape.rotation);

  const worldDX = localDX * cos - localDY * sin;
  const worldDY = localDX * sin + localDY * cos;

  // Update position
  shape.p1.x += worldDX;
  shape.p1.y += worldDY;

  // 8. Trigger the redraw
  redrawCanvas();
});

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function resizeCanvas() {
  // 1. Get the display size from CSS
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // 2. Only update if the size actually changed
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Warning: Changing these values clears the canvas content!
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    // console.log("resizeCanvas");
    init();
  }
}

// Observe changes to the canvas element itself
const ro = new ResizeObserver((entries) => {
  resizeCanvas();
});
ro.observe(canvas);

export { canvas, ctx, clearCanvas, init };
