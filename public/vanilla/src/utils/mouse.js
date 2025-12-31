import { state } from "../state.js";

const getCanvasMouseInput = (e) => {
  const boundRect = state.canvas.boundRect;
  return {
    mouseX: e.clientX - boundRect.left,
    mouseY: e.clientY - boundRect.top,
  };
};

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

export { getCanvasMouseInput, getLocalMouse };
