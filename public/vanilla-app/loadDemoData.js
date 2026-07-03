// public/vanilla-app/loadDemoData.js
// Renders a side-profile car built from rectangles, ellipses, and lines.
// Call AFTER editor.setRenderer() so document:modified triggers a real redraw.

// ── Color palette for scene drawing ─────────────────────────────────────────
// Groups of swatches the user can click to instantly set the active fill color.
const PALETTE = [
  {
    label: "Road",
    swatches: [
      { color: "#374151", title: "Asphalt" },
      { color: "#6b7280", title: "Road Grey" },
      { color: "#9ca3af", title: "Concrete" },
      { color: "#d1d5db", title: "Pavement" },
      { color: "#f3f4f6", title: "Kerb White" },
      { color: "#fbbf24", title: "Road Marking" },
    ],
  },
  {
    label: "Sky",
    swatches: [
      { color: "#0ea5e9", title: "Day Sky" },
      { color: "#38bdf8", title: "Light Sky" },
      { color: "#7dd3fc", title: "Pale Blue" },
      { color: "#1e3a5f", title: "Night Sky" },
      { color: "#312e81", title: "Dusk Purple" },
      { color: "#f97316", title: "Sunset Orange" },
    ],
  },
  {
    label: "Sun & Light",
    swatches: [
      { color: "#fef08a", title: "Sun Yellow" },
      { color: "#fde047", title: "Warm Sun" },
      { color: "#fb923c", title: "Sun Glow" },
      { color: "#ffffff", title: "White Light" },
      { color: "#fef9c3", title: "Soft Glow" },
      { color: "#fcd34d", title: "Gold" },
    ],
  },
  {
    label: "Nature",
    swatches: [
      { color: "#22c55e", title: "Grass Green" },
      { color: "#16a34a", title: "Dark Grass" },
      { color: "#86efac", title: "Light Grass" },
      { color: "#854d0e", title: "Dirt Brown" },
      { color: "#a16207", title: "Sand" },
      { color: "#6b21a8", title: "Mountain" },
    ],
  },
]

export function buildColorPalette() {
  // Remove existing palette if present (e.g. after clear)
  const existing = document.getElementById("color-palette-panel")
  if (existing) existing.remove()

  const panel = document.createElement("div")
  panel.id = "color-palette-panel"
  panel.className = "color-palette-panel"

  PALETTE.forEach((group) => {
    const groupEl = document.createElement("div")
    groupEl.className = "cp-group"

    const labelEl = document.createElement("span")
    labelEl.className = "cp-label"
    labelEl.textContent = group.label
    groupEl.appendChild(labelEl)

    const swatchRow = document.createElement("div")
    swatchRow.className = "cp-swatches"

    group.swatches.forEach(({ color, title }) => {
      const btn = document.createElement("button")
      btn.className = "cp-swatch"
      btn.title = title
      btn.style.setProperty("--swatch-color", color)
      btn.addEventListener("click", () => {
        // Sync the native color input and fire its input event so the
        // existing handler in main.js applies the color to selected shapes.
        const colorInput = document.getElementById("color-input")
        if (colorInput) {
          colorInput.value = color
          colorInput.dispatchEvent(new Event("input", { bubbles: true }))
        }
      })
      swatchRow.appendChild(btn)
    })

    groupEl.appendChild(swatchRow)
    panel.appendChild(groupEl)
  })

  document.body.appendChild(panel)
}

export function loadDemoData(editor, canvas) {
  const { document } = editor
  const { NodeType, ShapeType } = EditorEngine

  // Centre the 580×240 scene on the canvas.
  const sceneW = 580
  const sceneH = 240
  const canvasW = canvas ? canvas.clientWidth  : 1200
  const canvasH = canvas ? canvas.clientHeight : 740
  const OX = Math.max(40, Math.round((canvasW - sceneW) / 2))
  const OY = Math.max(40, Math.round((canvasH - sceneH) / 2))

  // Helper: add a shape node in one call.
  function add(id, name, parentId, tx, ty, rotation, shapeType, geometry, style) {
    const nodeOpts = {
      id,
      type: NodeType.SHAPE,
      name,
      children: [],
      transform: { x: OX + tx, y: OY + ty, rotation: rotation ?? 0 },
      visible: true,
      locked: false,
    }
    if (parentId) nodeOpts.parentId = parentId
    document.addNode(nodeOpts)
    document.addShape({ nodeId: id, type: shapeType, geometry, style })
  }

  // ── Ground shadow ────────────────────────────────────────────────────────
  add("shadow", "Ground Shadow", null,
    40, 210, 0,
    ShapeType.ELLIPSE,
    { width: 500, height: 18 },
    { fillColor: "#d1d5db", strokeColor: "transparent", strokeWidth: 0 })

  // ── Car body group ───────────────────────────────────────────────────────
  document.addNode({
    id: "car",
    type: NodeType.GROUP,
    name: "Car",
    children: [],
    transform: { x: OX, y: OY, rotation: 0 },
    visible: true,
    locked: false,
  })

  // Main lower body (cabin + hood + trunk)
  add("body-main", "Body", "car",
    30, 130, 0,
    ShapeType.RECTANGLE,
    { width: 520, height: 70 },
    { fillColor: "#3b82f6", strokeColor: "#1d4ed8", strokeWidth: 2 })

  // Roof / cabin
  add("roof", "Roof", "car",
    120, 60, 0,
    ShapeType.RECTANGLE,
    { width: 280, height: 75 },
    { fillColor: "#2563eb", strokeColor: "#1d4ed8", strokeWidth: 2 })

  // Front windshield
  add("windshield-front", "Front Windshield", "car",
    385, 65, 0,
    ShapeType.RECTANGLE,
    { width: 16, height: 65 },
    { fillColor: "#bfdbfe", strokeColor: "#93c5fd", strokeWidth: 1 })

  // Rear windshield
  add("windshield-rear", "Rear Windshield", "car",
    120, 65, 0,
    ShapeType.RECTANGLE,
    { width: 16, height: 65 },
    { fillColor: "#bfdbfe", strokeColor: "#93c5fd", strokeWidth: 1 })

  // Side window (main glass)
  add("window", "Side Window", "car",
    140, 67, 0,
    ShapeType.RECTANGLE,
    { width: 241, height: 61 },
    { fillColor: "#dbeafe", strokeColor: "#93c5fd", strokeWidth: 1 })

  // Window divider (B-pillar)
  add("b-pillar", "B-Pillar", "car",
    258, 67, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 0, y2: 61, lineWidth: 3 },
    { fillColor: "transparent", strokeColor: "#1d4ed8", strokeWidth: 3 })

  // ── Wheels group ─────────────────────────────────────────────────────────
  document.addNode({
    id: "wheels",
    type: NodeType.GROUP,
    name: "Wheels",
    children: [],
    transform: { x: OX, y: OY, rotation: 0 },
    visible: true,
    locked: false,
  })

  // Rear wheel arch cutout (dark ellipse behind wheel)
  add("arch-rear", "Rear Arch", "wheels",
    80, 160, 0,
    ShapeType.ELLIPSE,
    { width: 90, height: 42 },
    { fillColor: "#1e3a5f", strokeColor: "#1d4ed8", strokeWidth: 0 })

  // Front wheel arch cutout
  add("arch-front", "Front Arch", "wheels",
    400, 160, 0,
    ShapeType.ELLIPSE,
    { width: 90, height: 42 },
    { fillColor: "#1e3a5f", strokeColor: "#1d4ed8", strokeWidth: 0 })

  // Rear tyre (outer)
  add("tyre-rear", "Rear Tyre", "wheels",
    77, 163, 0,
    ShapeType.ELLIPSE,
    { width: 96, height: 96 },
    { fillColor: "#111827", strokeColor: "#374151", strokeWidth: 2 })

  // Front tyre (outer)
  add("tyre-front", "Front Tyre", "wheels",
    397, 163, 0,
    ShapeType.ELLIPSE,
    { width: 96, height: 96 },
    { fillColor: "#111827", strokeColor: "#374151", strokeWidth: 2 })

  // Rear rim
  add("rim-rear", "Rear Rim", "wheels",
    101, 187, 0,
    ShapeType.ELLIPSE,
    { width: 48, height: 48 },
    { fillColor: "#d1d5db", strokeColor: "#9ca3af", strokeWidth: 2 })

  // Front rim
  add("rim-front", "Front Rim", "wheels",
    421, 187, 0,
    ShapeType.ELLIPSE,
    { width: 48, height: 48 },
    { fillColor: "#d1d5db", strokeColor: "#9ca3af", strokeWidth: 2 })

  // Rim hub (rear)
  add("hub-rear", "Rear Hub", "wheels",
    117, 203, 0,
    ShapeType.ELLIPSE,
    { width: 16, height: 16 },
    { fillColor: "#6b7280", strokeColor: "#4b5563", strokeWidth: 1 })

  // Rim hub (front)
  add("hub-front", "Front Hub", "wheels",
    437, 203, 0,
    ShapeType.ELLIPSE,
    { width: 16, height: 16 },
    { fillColor: "#6b7280", strokeColor: "#4b5563", strokeWidth: 1 })

  // Rim spokes — rear (3 lines through centre)
  add("spoke-rear-h", "Rear Spoke H", "wheels",
    101, 210, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 48, y2: 0, lineWidth: 2 },
    { fillColor: "transparent", strokeColor: "#9ca3af", strokeWidth: 2 })

  add("spoke-rear-v", "Rear Spoke V", "wheels",
    125, 187, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 0, y2: 48, lineWidth: 2 },
    { fillColor: "transparent", strokeColor: "#9ca3af", strokeWidth: 2 })

  // Rim spokes — front
  add("spoke-front-h", "Front Spoke H", "wheels",
    421, 210, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 48, y2: 0, lineWidth: 2 },
    { fillColor: "transparent", strokeColor: "#9ca3af", strokeWidth: 2 })

  add("spoke-front-v", "Front Spoke V", "wheels",
    445, 187, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 0, y2: 48, lineWidth: 2 },
    { fillColor: "transparent", strokeColor: "#9ca3af", strokeWidth: 2 })

  // ── Lights group ─────────────────────────────────────────────────────────
  document.addNode({
    id: "lights",
    type: NodeType.GROUP,
    name: "Lights",
    children: [],
    transform: { x: OX, y: OY, rotation: 0 },
    visible: true,
    locked: false,
  })

  // Headlight (front)
  add("headlight", "Headlight", "lights",
    524, 140, 0,
    ShapeType.RECTANGLE,
    { width: 26, height: 20 },
    { fillColor: "#fef08a", strokeColor: "#ca8a04", strokeWidth: 1 })

  // Headlight lens glare
  add("headlight-glare", "Headlight Glare", "lights",
    527, 143, 0,
    ShapeType.ELLIPSE,
    { width: 10, height: 10 },
    { fillColor: "#ffffff", strokeColor: "transparent", strokeWidth: 0 })

  // Tail-light (rear)
  add("taillight", "Tail Light", "lights",
    30, 140, 0,
    ShapeType.RECTANGLE,
    { width: 20, height: 20 },
    { fillColor: "#ef4444", strokeColor: "#b91c1c", strokeWidth: 1 })

  // ── Bumpers & underline ───────────────────────────────────────────────────
  add("bumper-front", "Front Bumper", "car",
    516, 188, 0,
    ShapeType.RECTANGLE,
    { width: 34, height: 14 },
    { fillColor: "#1d4ed8", strokeColor: "#1e3a8a", strokeWidth: 1 })

  add("bumper-rear", "Rear Bumper", "car",
    30, 188, 0,
    ShapeType.RECTANGLE,
    { width: 34, height: 14 },
    { fillColor: "#1d4ed8", strokeColor: "#1e3a8a", strokeWidth: 1 })

  // Door line (styling crease along the body)
  add("door-crease", "Door Crease", "car",
    120, 165, 0,
    ShapeType.LINE,
    { x1: 0, y1: 0, x2: 340, y2: 0, lineWidth: 1 },
    { fillColor: "transparent", strokeColor: "#1d4ed8", strokeWidth: 1 })

  // Single emit — triggers renderer + LayerPanel in one shot
  editor.events.emit("document:modified")
}
