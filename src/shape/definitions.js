import { state } from "../state.js";

const getRectangleObject = ({ x, y, width, height }) => {
  let shape = {
    id: crypto.randomUUID(),
    p1: { x, y },
    p2: {},
    type: "rectangle",
    width,
    height,
    rotation: 0,
    fillStyle: state.selectedTool.color,
  };
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  shape.center = { x: shape.p1.x + halfW, y: shape.p1.y + halfH };

  const path = new Path2D();
  path.rect(-halfW, -halfH, shape.width, shape.height);
  shape.path = path;
  return shape;
};

const getRectangleHandlesPath = (ctx, shape) => {
  const edgePaths = getEdgePaths(shape);
  const cornerPaths = getCornerPaths(shape);
  const rotatePaths = getRotatePaths(shape);

  return {
    cornerPaths,
    edgePaths,
    rotatePaths,
  };
};

function getEdgePaths(shape) {
  const edgePaths = {
    top: new Path2D(),
    bottom: new Path2D(),
    left: new Path2D(),
    right: new Path2D(),
  };
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  edgePaths.top = new Path2D();
  edgePaths.top.moveTo(-halfW, -halfH);
  edgePaths.top.lineTo(halfW, -halfH);

  // 2. RIGHT EDGE: Top to Bottom
  edgePaths.right = new Path2D();
  edgePaths.right.moveTo(halfW, -halfH);
  edgePaths.right.lineTo(halfW, halfH);

  // 3. BOTTOM EDGE: Right to Left
  edgePaths.bottom = new Path2D();
  edgePaths.bottom.moveTo(halfW, halfH);
  edgePaths.bottom.lineTo(-halfW, halfH);

  // 4. LEFT EDGE: Bottom to Top
  edgePaths.left = new Path2D();
  edgePaths.left.moveTo(-halfW, halfH);
  edgePaths.left.lineTo(-halfW, -halfH);
  return edgePaths;
}

function getCornerPaths(shape) {
  const cornerPaths = {
    tl: new Path2D(),
    tr: new Path2D(),
    br: new Path2D(),
    bl: new Path2D(),
  };
  const size = 10; // Handle size
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  // 1. Draw the Border Rectangle

  // 2. Define and Record Handle Paths
  // We create new Path2D objects that inherit the current transformation matrix
  cornerPaths.tl = new Path2D();
  cornerPaths.tl.rect(-halfW - size / 2, -halfH - size / 2, size, size);

  cornerPaths.tr = new Path2D();
  cornerPaths.tr.rect(halfW - size / 2, -halfH - size / 2, size, size);

  cornerPaths.br = new Path2D();
  cornerPaths.br.rect(halfW - size / 2, halfH - size / 2, size, size);

  cornerPaths.bl = new Path2D();
  cornerPaths.bl.rect(-halfW - size / 2, halfH - size / 2, size, size);

  // 3. Fill the handles so they are visible

  return cornerPaths;
}

function getRotatePaths(shape) {
  const rotatePaths = {
    tl: new Path2D(),
    tr: new Path2D(),
    br: new Path2D(),
    bl: new Path2D(),
  };
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  const padding = 15; // Distance from the corner to the center of the handle
  const hitRadius = 12; // The radius of the clickable area

  // 2. Define Rotation Paths as circles centered at the offset corners
  // Top Left
  rotatePaths.tl = new Path2D();
  rotatePaths.tl.arc(
    -halfW - padding,
    -halfH - padding,
    hitRadius,
    0,
    Math.PI * 2
  );

  // Top Right
  rotatePaths.tr = new Path2D();
  rotatePaths.tr.arc(
    halfW + padding,
    -halfH - padding,
    hitRadius,
    0,
    Math.PI * 2
  );

  // Bottom Right
  rotatePaths.br = new Path2D();
  rotatePaths.br.arc(
    halfW + padding,
    halfH + padding,
    hitRadius,
    0,
    Math.PI * 2
  );

  // Bottom Left
  rotatePaths.bl = new Path2D();
  rotatePaths.bl.arc(
    -halfW - padding,
    halfH + padding,
    hitRadius,
    0,
    Math.PI * 2
  );

  /**
   * OPTIONAL: Debug Drawing
   * To see the hit zones while developing, uncomment the lines below:
   */

  return rotatePaths;
}

export { getRectangleObject, getRectangleHandlesPath };
