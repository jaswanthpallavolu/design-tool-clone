export const state = {
  shapesById: {},
  selectedShapeId: null,
  hoveredShapeId: null,
  handlePaths: {},
  selectedTool: { id: "rectangle", color: "#FF4A2E" },
  canvas: {},
  imageData: null,
  isRotating: false,
  isResizing: false,
  //     interaction: {
  //     mode: "none",           // "none", "drawing", "dragging", "resizing", "rotating"
  //     currentHandle: null,    // "tl", "tr", "rot", etc.
  //     origin: { x: 0, y: 0 }, // Mouse position when action started
  //     offset: { x: 0, y: 0 }, // Offset from shape center to mouse
  //   },
  startAngle: 0,
  initialRotation: 0,
  currentHandle: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
};
