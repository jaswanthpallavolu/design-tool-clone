"use client"
import { useEffect, useRef } from "react"
import { Editor, CanvasRenderer, type PointerEventData } from "@/editor-engine"
import { useGlobalContext } from "@/app/components/hooks/useGlobalContext"

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { editorRef } = useGlobalContext()
  const rendererRef = useRef<CanvasRenderer | null>(null)

  const createPointerEventData = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ): PointerEventData => {
    const canvas = canvasRef.current
    if (!canvas) {
      return {
        clientX: 0,
        clientY: 0,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        button: e.button,
      }
    }

    const rect = canvas.getBoundingClientRect()
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editorRef.current) return
    editorRef.current.onPointerDown(createPointerEventData(e))
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editorRef.current) return
    editorRef.current.onPointerMove(createPointerEventData(e))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editorRef.current) return
    editorRef.current.onPointerUp(createPointerEventData(e))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const editor = new Editor()
    editorRef.current = editor

    const renderer = new CanvasRenderer({ canvas, editor })
    rendererRef.current = renderer
    editor.setRenderer(renderer)

    const handleKeyDown = (e: KeyboardEvent) => {
      editor.onKeyDown(e)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      editor.onKeyUp(e)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [editorRef])

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = rendererRef.current
    if (!canvas || !renderer) return

    const resizeCanvas = () => {
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight

        renderer.renderShapes()
        renderer.renderHoverOutline()
        renderer.renderSelectionBox()
        renderer.renderSelectionHandles()
      }
    }

    resizeCanvas()

    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (entries[0]?.target === canvas) {
          resizeCanvas()
        }
      })
    })

    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute h-full w-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  )
}

// Made with Bob
