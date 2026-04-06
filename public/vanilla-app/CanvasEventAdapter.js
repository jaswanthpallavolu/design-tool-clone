export default class CanvasEventAdapter {
  canvas
  ctx
  editor

  constructor(canvas, editor) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })
    this.editor = editor

    this.canvas.addEventListener("pointerdown", (e) => {
      this.editor.onPointerDown(this.createPointerEventData(e))
    })

    this.canvas.addEventListener("pointermove", (e) => {
      this.editor.onPointerMove(this.createPointerEventData(e))
    })

    this.canvas.addEventListener("pointerup", (e) => {
      this.editor.onPointerUp(this.createPointerEventData(e))
    })

    // Keyboard events - listen on window for global keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      this.editor.onKeyDown(e)
    })

    window.addEventListener("keyup", (e) => {
      this.editor.onKeyUp(e)
    })
  }

  createPointerEventData(e) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      clientX: e.clientX - rect.left,
      clientY: e.clientY - rect.top,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      button: e.button,
    }
  }
}
