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
let startAngle = 0;
let initialRotation = 0;

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
  shapePath = drawShape(ctx, shape);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const detectShape = (e) => {
  ctx.save();
  const x = e.clientX - boundRect.left;
  const y = e.clientY - boundRect.top;

  if (shape.isSelected) {
    detectShapeHandles(ctx, { ...shape, ...shapeHandlesPath }, x, y);
    return;
  }
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  // ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  // ctx.rotate(shape.rotation);
  const hitfound = ctx.isPointInPath(shapePath, x, y);
  ctx.restore();

  if (hitfound) {
    ctx.strokeStyle = "#00aaff";
    // ctx.lineWidth = 2;
    // ctx.setLineDash([5, 5]);
    // ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
    // ctx.rotate(shape.rotation);
    ctx.stroke(shapePath);
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

  // const halfW = shape.width / 2;
  // const halfH = shape.height / 2;
  // ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  // ctx.rotate(shape.rotation);
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
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  // 1. Move to Local Space to check hit detection
  ctx.save();
  ctx.translate(shape.p1.x + shape.width / 2, shape.p1.y + shape.height / 2);
  ctx.rotate(shape.rotation);

  const { rotatePaths } = shapeHandlesPath;
  let hitHandle = null;
  for (let key in rotatePaths) {
    if (ctx.isPointInPath(rotatePaths[key], mouseX, mouseY)) {
      hitHandle = key;
      break;
    }
  }
  ctx.restore();

  if (hitHandle) {
    isRotating = true;

    // 2. Calculate the "Starting Angle" of the mouse relative to center
    const centerX = shape.p1.x + shape.width / 2;
    const centerY = shape.p1.y + shape.height / 2;

    // This is where the mouse is right now
    startAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // Save the shape's current rotation
    initialRotation = shape.rotation;
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

  // render(); // Redraw the canvas
  clearCanvas();
  shapePath = drawShape(ctx, shape);
  shapeHandlesPath = drawShapeHandles(ctx, shape);
});

window.addEventListener("mouseup", () => {
  isRotating = false;
});
// End of rotation logic

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
