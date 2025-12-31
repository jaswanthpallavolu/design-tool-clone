import { state } from "../state.js";
import { redrawCanvas } from "../canvas/renderer.js";

function deleteShape(e) {
  if (e.key === "Backspace" && state.selectedShapeId) {
    e.preventDefault();

    const shapes = { ...state.shapesById };
    delete shapes[state.selectedShapeId];
    state.shapesById = shapes;
    state.selectedShapeId = null;
    redrawCanvas();
  }
}
export { deleteShape };
