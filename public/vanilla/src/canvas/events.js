import { isShapeSelected } from "../shape/hit-test.js";
import { startDrawing } from "../tool/draw-tool.js";
import { resetInteraction } from "../shape/transform.js";
import { stopDrawing } from "../tool/draw-tool.js";
import { deleteShape } from "../shape/actions.js";
import { handleToolSelection } from "../ui/toolbar.js";
import { state } from "../state.js";

function handleCanvasMouseDown(e) {
  state.multiSelect = e.shiftKey;
  if (isShapeSelected(e)) return;
  startDrawing(e);
}

function handleCanvasMouseUp(e) {
  resetInteraction();
  stopDrawing();
}

function handleCanvasKeyDown(e) {
  deleteShape(e);
  handleToolSelection(e);
}

function handleCanvasKeyUp(e) {}

export {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasKeyDown,
  handleCanvasKeyUp,
};
