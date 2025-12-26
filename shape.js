function drawShape(ctx, shape) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  ctx.save();
  ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  ctx.rotate(shape.rotation);

  const shapePath = new Path2D();
  //   shapePath.moveTo(shape.p1.x, shape.p1.y);
  //   shapePath.rect(shape.p1.x, shape.p1.y, shape.width, shape.height);
  shapePath.rect(-halfW, -halfH, shape.width, shape.height);
  ctx.fillStyle = shape.fillStyle;
  ctx.fill(shapePath);
  ctx.restore();
  return shapePath;
}

function drawShapeHandles(ctx, shape) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  ctx.save();
  ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  ctx.rotate(shape.rotation);

  // ctx.strokeRect(-halfW, -halfH, shape.width, shape.height);
  const edgePaths = drawEdges(ctx, shape);
  const cornerPaths = drawCorners(ctx, shape);
  const rotatePaths = drawRotationCorners(ctx, shape);

  ctx.restore();

  return {
    cornerPaths,
    edgePaths,
    rotatePaths,
  };
}

// State to keep track of handle paths
const cornerPaths = {
  tl: new Path2D(),
  tr: new Path2D(),
  br: new Path2D(),
  bl: new Path2D(),
};

const edgePaths = {
  top: new Path2D(),
  bottom: new Path2D(),
  left: new Path2D(),
  right: new Path2D(),
};

const rotatePaths = {
  tl: new Path2D(),
  tr: new Path2D(),
  br: new Path2D(),
  bl: new Path2D(),
};

function drawEdges(ctx, shape) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  ctx.strokeStyle = "#00aaff";

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

  Object.values(edgePaths).forEach((path) => {
    ctx.stroke(path);
  });
  return edgePaths;
}

function drawCorners(ctx, shape) {
  const size = 10; // Handle size
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;

  // 1. Draw the Border Rectangle
  ctx.strokeStyle = "#00aaff";

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
  ctx.fillStyle = "white";
  Object.values(cornerPaths).forEach((path) => {
    ctx.fill(path);
    ctx.stroke(path);
  });
  return cornerPaths;
}

function drawRotationCorners(ctx, shape) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  const padding = 10; // Distance from the corner to the center of the handle
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
  ctx.strokeStyle = "blue";
  Object.values(rotatePaths).forEach((path) => {
    ctx.stroke(path);
  });
  return rotatePaths;
}

function checkHandlesPathHit(ctx, paths = {}, mouseX, mouseY) {
  // Increase lineWidth temporarily for a larger 'grab' area
  ctx.lineWidth = 10;

  for (const [side, path] of Object.entries(paths)) {
    if (
      ctx.isPointInStroke(path, mouseX, mouseY) ||
      ctx.isPointInPath(path, mouseX, mouseY)
    ) {
      return side; // Returns 'top', 'right', etc.
    }
  }
  return null;
}

function detectShapeHandles(ctx, shape, x, y) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  ctx.save();
  ctx.translate(shape.p1.x + halfW, shape.p1.y + halfH);
  ctx.rotate(shape.rotation);
  const hit1 = checkHandlesPathHit(ctx, shape.cornerPaths, x, y);
  const hit2 = checkHandlesPathHit(ctx, shape.rotatePaths, x, y);
  const hit3 = checkHandlesPathHit(ctx, shape.edgePaths, x, y);

  if (hit1) console.log("checkCornerHit ", hit1);
  else if (hit2) console.log("checkRotationHit ", hit2);
  else if (hit3) console.log("checkEdgeHit ", hit3);
  ctx.restore();
  return { rotate: hit2, resize: hit1 || hit3 };
}

export { drawShape, drawShapeHandles, detectShapeHandles };
