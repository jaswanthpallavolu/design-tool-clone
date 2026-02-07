function getRectAABB(cx, cy, w, h, angle) {
  const hw = w / 2;
  const hh = h / 2;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const corners = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  for (const p of corners) {
    const x = p.x * cos - p.y * sin + cx;
    const y = p.x * sin + p.y * cos + cy;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { minX, minY, maxX, maxY };
}

function getLineAABB(x1, y1, x2, y2, strokeWidth = 0) {
  let minX = Math.min(x1, x2);
  let minY = Math.min(y1, y2);
  let maxX = Math.max(x1, x2);
  let maxY = Math.max(y1, y2);

  if (strokeWidth > 0) {
    const pad = strokeWidth / 2;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
  }

  return { minX, minY, maxX, maxY };
}

function unionAABBs(aabbs) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const b of aabbs) {
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }

  return { minX, minY, maxX, maxY };
}

export { getRectAABB, getLineAABB, unionAABBs };
