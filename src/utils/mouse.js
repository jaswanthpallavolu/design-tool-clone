import { state } from "../state.js";

const getCanvasMouseInput = (e) => {
  const boundRect = state.canvas.boundRect;
  return {
    mouseX: e.clientX - boundRect.left,
    mouseY: e.clientY - boundRect.top,
  };
};

export { getCanvasMouseInput };
