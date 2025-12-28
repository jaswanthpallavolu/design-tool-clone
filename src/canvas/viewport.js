import { state } from "../state.js";
/**
 * Initializes resizing logic for a target canvas and
 * calls a callback function whenever a redraw is needed.
 */
export function initViewport(canvas, onResize) {
  const resizeCanvas = () => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Update state for coordinate calculations
      state.canvas.boundRect = canvas.getBoundingClientRect();

      // Notify the rest of the app to redraw
      onResize();
    }
  };

  const ro = new ResizeObserver(() => {
    // Use requestAnimationFrame to prevent "ResizeObserver loop limit" errors
    window.requestAnimationFrame(resizeCanvas);
  });

  ro.observe(canvas);

  // Initial call to set size
  resizeCanvas();
}
