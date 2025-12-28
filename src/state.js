export const state = {
  shapesById: {},
  selectedShapeId: null,
  hoveredShapeId: null,
  handlePaths: {},
  selectedTool: { id: "rectangle", color: "#FF4A2E" },
  canvas: {
    boundRect: null,
  },
  imageData: null,
  interaction: {
    mode: "none", // "none", "drawing", "dragging", "resizing", "rotating"
    currentHandle: null, // "tl", "tr", "rot", etc.
    origin: { x: 0, y: 0 }, // Mouse position when action started
    offset: { x: 0, y: 0 }, // Offset from shape center to mouse
  },
  transform: {
    startAngle: 0,
    initialRotation: 0,
    initialBounds: { width: 0, height: 0, x: 0, y: 0 },
  },
};
