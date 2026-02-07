import { state } from "../state.js";
import { redrawCanvas } from "../canvas/renderer.js";
import { resetInteraction } from "./transform.js";

function deleteShape(e) {
  if (e.key === "Backspace" && state.selectedShapes.size > 0) {
    e.preventDefault();
    const shapes = { ...state.shapesById };
    Array.from(state.selectedShapes).forEach((shapeId) => {
      delete shapes[shapeId];
    });
    state.shapesById = shapes;
    state.selectedShapes.clear();
    redrawCanvas();
  }
}
export { deleteShape };
