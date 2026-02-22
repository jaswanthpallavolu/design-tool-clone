export default class CanvasEventAdapter {
  canvas
  ctx
  editor

  constructor(canvas, editor) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.editor = editor

    this.canvas.addEventListener("pointerdown", (e) => {
      const coords = this.transformCoordinates(e)
      this.editor.onPointerDown({ ...e, ...coords })
    })

    this.canvas.addEventListener("pointermove", (e) => {
      const coords = this.transformCoordinates(e)
      this.editor.onPointerMove({ ...e, ...coords })
    })

    this.canvas.addEventListener("pointerup", (e) => {
      const coords = this.transformCoordinates(e)
      this.editor.onPointerUp({ ...e, ...coords })
    })
  }

  transformCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      clientX: e.clientX - rect.left,
      clientY: e.clientY - rect.top,
    }
  }
}
