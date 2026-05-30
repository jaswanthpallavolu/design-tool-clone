# Vanilla JavaScript Implementation

Pure JavaScript integration of the editor engine without framework dependencies.

## Features

- HTML5 Canvas rendering
- Native event handling
- Shape manipulation
- Undo/redo support
- Layer management
- Keyboard shortcuts

## Running

```bash
# Build the engine first
npm run build:engine

# Start the dev server
npm run dev
```

Then navigate to http://localhost:3000 and click "VanillaJS Engine" from the home page.

## Integration

```javascript
import { Editor } from "../../editor-engine/index.js"

const canvas = document.getElementById("canvas")
const editor = new Editor(canvas)

canvas.addEventListener("mousedown", (e) => {
  editor.handlePointerDown({
    x: e.clientX,
    y: e.clientY,
    button: e.button,
  })
})
```

## Structure

- `main.js` - Application initialization
- `CanvasEventAdapter.js` - Event system adapter
- `LayerPanel.js` - Layer management UI
- `ShortcutsModal.js` - Keyboard shortcuts UI

For a production app with collaboration, see [Next.js implementation](../../app/README.md).
