import { state } from "../state.js";
import { getRectAABB, getLineAABB } from "../utils/boundingBox.js";

const getShapeObject = (type) => {
  return {
    id: crypto.randomUUID(),
    fillStyle: state.selectedTool.fillColor,
    strokeStyle: state.selectedTool.strokeColor,
    type,
  };
};

const getRectangleObject = ({ x, y, width, height }) => {
  let shape = getShapeObject("rectangle");
  shape = {
    ...shape,
    p1: { x, y },
    p2: {},
    width,
    height,
    rotation: 0,
  };

  return getRectanglePath(shape);
};

function getEllipseObject({ x, y, width, height }) {
  let shape = getShapeObject("ellipse");
  shape = {
    ...shape,
    p1: { x, y },
    p2: {},
    width,
    height,
    rotation: 0,
  };
  return getEllipsePath(shape);
}

function getLineObject(p1, p2) {
  let shape = getShapeObject("line");
  shape = {
    ...shape,
    p1,
    p2,
    rotation: 0,
    lineWidth: 4,
  };
  return getLinePath(shape);
}

function getShapePath(shape) {
  const getPath = {
    rectangle: getRectanglePath,
    ellipse: getEllipsePath,
    line: getLinePath,
  };
  return getPath?.[shape.type](shape);
}

function getRectanglePath(shape) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  shape.center = { x: shape.p1.x + halfW, y: shape.p1.y + halfH };

  const path = new Path2D();
  path.rect(-halfW, -halfH, shape.width, shape.height);
  shape.path = path;
  return shape;
}

function getEllipsePath(shape) {
  const absW = Math.abs(shape.width);
  const absH = Math.abs(shape.height);

  const halfW = absW / 2;
  const halfH = absH / 2;

  shape.center = {
    x: shape.p1.x + shape.width / 2,
    y: shape.p1.y + shape.height / 2,
  };

  const path = new Path2D();
  path.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
  shape.path = path;
  return shape;
}

function getLinePath(shape) {
  const midX = (shape.p1.x + shape.p2.x) / 2;
  const midY = (shape.p1.y + shape.p2.y) / 2;
  shape.center = { x: midX, y: midY };

  const path = new Path2D();
  path.moveTo(shape.p1.x - midX, shape.p1.y - midY);
  path.lineTo(shape.p2.x - midX, shape.p2.y - midY);
  shape.path = path;
  return shape;
}

const getShapeHandlesPath = (shape) => {
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
  const edgePaths = {};
  if (shape.type === "line") return {};
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
  const cornerPaths = {};
  const size = 10; // Handle size

  // 2. Define and Record Handle Paths
  // We create new Path2D objects that inherit the current transformation matrix
  if (shape.type === "line") {
    const relP1X = shape.p1.x - shape.center.x;
    const relP1Y = shape.p1.y - shape.center.y;

    const relP2X = shape.p2.x - shape.center.x;
    const relP2Y = shape.p2.y - shape.center.y;
    cornerPaths.left = new Path2D();
    cornerPaths.left.rect(relP1X - size / 2, relP1Y - size / 2, size, size);

    cornerPaths.right = new Path2D();
    cornerPaths.right.rect(relP2X - size / 2, relP2Y - size / 2, size, size);
  } else {
    const halfW = shape.width / 2;
    const halfH = shape.height / 2;

    cornerPaths.tl = new Path2D();
    cornerPaths.tl.rect(-halfW - size / 2, -halfH - size / 2, size, size);

    cornerPaths.tr = new Path2D();
    cornerPaths.tr.rect(halfW - size / 2, -halfH - size / 2, size, size);

    cornerPaths.br = new Path2D();
    cornerPaths.br.rect(halfW - size / 2, halfH - size / 2, size, size);

    cornerPaths.bl = new Path2D();
    cornerPaths.bl.rect(-halfW - size / 2, halfH - size / 2, size, size);
  }

  return cornerPaths;
}

function getRotatePaths(shape) {
  const rotatePaths = {};
  let padding = 15; // Distance from the corner to the center of the handle
  const hitRadius = 12; // The radius of the clickable area

  // 2. Define Rotation Paths as circles centered at the offset corners

  if (shape.type === "line") {
    padding = 20;
    // 1. Get relative positions of endpoints from the center (0,0)
    const relP1X = shape.p1.x - shape.center.x;
    const relP1Y = shape.p1.y - shape.center.y;

    const relP2X = shape.p2.x - shape.center.x;
    const relP2Y = shape.p2.y - shape.center.y;

    // 2. Calculate the direction vector to push handles "outward"
    const length = Math.sqrt(
      Math.pow(shape.p2.x - shape.p1.x, 2) +
        Math.pow(shape.p2.y - shape.p1.y, 2),
    );

    // Normalized direction from center to P1 and P2
    const dirP1X = relP1X / (length / 2);
    const dirP1Y = relP1Y / (length / 2);

    const dirP2X = relP2X / (length / 2);
    const dirP2Y = relP2Y / (length / 2);

    // 3. Create Rotation Path for P1 side
    rotatePaths.rotP1 = new Path2D();
    rotatePaths.rotP1.arc(
      relP1X + dirP1X * padding,
      relP1Y + dirP1Y * padding,
      hitRadius,
      0,
      Math.PI * 2,
    );

    // 4. Create Rotation Path for P2 side
    rotatePaths.rotP2 = new Path2D();
    rotatePaths.rotP2.arc(
      relP2X + dirP2X * padding,
      relP2Y + dirP2Y * padding,
      hitRadius,
      0,
      Math.PI * 2,
    );
  } else {
    const halfW = Math.abs(shape.width) / 2;
    const halfH = Math.abs(shape.height) / 2;
    // Top Left
    rotatePaths.tl = new Path2D();
    rotatePaths.tl.arc(
      -halfW - padding,
      -halfH - padding,
      hitRadius,
      0,
      Math.PI * 2,
    );

    // Top Right
    rotatePaths.tr = new Path2D();
    rotatePaths.tr.arc(
      halfW + padding,
      -halfH - padding,
      hitRadius,
      0,
      Math.PI * 2,
    );

    // Bottom Right
    rotatePaths.br = new Path2D();
    rotatePaths.br.arc(
      halfW + padding,
      halfH + padding,
      hitRadius,
      0,
      Math.PI * 2,
    );

    // Bottom Left
    rotatePaths.bl = new Path2D();
    rotatePaths.bl.arc(
      -halfW - padding,
      halfH + padding,
      hitRadius,
      0,
      Math.PI * 2,
    );
  }

  /**
   * OPTIONAL: Debug Drawing
   * To see the hit zones while developing, uncomment the lines below:
   */

  return rotatePaths;
}

function getBoundingBox(shape) {
  let boundingBox;
  if (shape.type === "line") {
    boundingBox = getLineAABB(
      shape.p1.x,
      shape.p1.y,
      shape.p2.x,
      shape.p2.y,
      shape.lineWidth,
    );
  } else {
    boundingBox = getRectAABB(
      shape.center.x,
      shape.center.y,
      shape.width,
      shape.height,
      shape.rotation,
    );
  }
  const { minX, minY, maxX, maxY } = boundingBox;
  const width = maxX - minX;
  const height = maxY - minY;
  let boxShape = getRectangleObject({ x: minX, y: minY, width, height });
  boxShape.boundingBox = boundingBox;
  return boxShape;
}

export {
  getRectangleObject,
  getRectanglePath,
  getEllipseObject,
  getLineObject,
  getShapeHandlesPath,
  getShapePath,
  getBoundingBox,
};
