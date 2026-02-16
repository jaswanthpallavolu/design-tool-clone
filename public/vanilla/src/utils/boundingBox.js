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

function aabbIntersects(a, b) {
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  );
}

// https://www.geeksforgeeks.org/computer-graphics/liang-barsky-algorithm/
function lineIntersectsAABB(x1, y1, x2, y2, box) {
  let t0 = 0;
  let t1 = 1;

  const dx = x2 - x1;
  const dy = y2 - y1;

  function clip(p, q) {
    if (p === 0) {
      // Line is parallel to this boundary
      return q >= 0;
    }

    const r = q / p;

    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }

    return true;
  }

  // left   : x >= minX  ->  dx * t + x1 >= minX
  if (!clip(-dx, x1 - box.minX)) return false;

  // right  : x <= maxX
  if (!clip(dx, box.maxX - x1)) return false;

  // bottom : y >= minY
  if (!clip(-dy, y1 - box.minY)) return false;

  // top    : y <= maxY
  if (!clip(dy, box.maxY - y1)) return false;

  return t0 <= t1;
}

export {
  getRectAABB,
  getLineAABB,
  unionAABBs,
  aabbIntersects,
  lineIntersectsAABB,
};
