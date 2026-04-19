"use client"
import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import type { Tool, ColorSwatch } from "./types"
import {
  tools as initialTools,
  colorSwatches as initialColorSwatches,
} from "./constants"
import { useGlobalContext } from "@/app/components/hooks/useGlobalContext"
import {
  SelectTool,
  RectangleTool,
  EllipseTool,
  LineTool,
} from "@/editor-engine"
import { ToolButton } from "./ToolButton"
import { ColorPalette } from "./ColorPalette"

// Color mapping from swatch IDs to hex colors
const colorMap: Record<string, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#71717a",
  black: "#18181b",
}

export function Sidebar() {
  const { editorRef } = useGlobalContext()
  const [tools, setTools] = useState(initialTools)
  const [colorSwatches, setColorSwatches] = useState(initialColorSwatches)

  // Initialize editor tools and colors
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // Add tools to editor
    const editorTools = [
      { id: "select", component: SelectTool },
      { id: "rectangle", component: RectangleTool },
      { id: "ellipse", component: EllipseTool },
      { id: "line", component: LineTool },
    ]

    editor.addTools(editorTools.map((tool) => new tool.component()))
    editor.setActiveTool("rectangle")

    // Set initial tool options (color)
    const initialActiveColor = initialColorSwatches.find((s) => s.isActive)
    if (initialActiveColor) {
      const hexColor = colorMap[initialActiveColor.id]
      if (hexColor) {
        editor.updateToolOptions({
          strokeColor: hexColor,
          fillColor: hexColor,
        })
      }
    }

    // Set up callback to sync UI when tool changes (e.g., via keyboard shortcuts)
    editor.onToolChanged = (toolId: string) => {
      setTools((prevTools) =>
        prevTools.map((tool) => ({
          ...tool,
          isActive: tool.id === toolId,
        })),
      )
    }
  }, [editorRef])

  const handleToolSelect = (toolId: string) => {
    const editor = editorRef.current
    if (!editor) return

    // Update active tool in editor
    editor.setActiveTool(toolId)

    // Update UI state
    setTools((prevTools) =>
      prevTools.map((tool) => ({
        ...tool,
        isActive: tool.id === toolId,
      })),
    )
  }

  const handleColorSelect = (colorId: string) => {
    const editor = editorRef.current
    if (!editor) return

    const hexColor = colorMap[colorId]
    if (!hexColor) return

    // Update tool options in editor
    editor.updateToolOptions({
      strokeColor: hexColor,
      fillColor: hexColor,
    })

    // Update UI state
    setColorSwatches((prevSwatches) =>
      prevSwatches.map((swatch) => ({
        ...swatch,
        isActive: swatch.id === colorId,
      })),
    )
  }

  const handleClear = () => {
    const editor = editorRef.current
    if (!editor) return

    editor.clear()
  }

  return (
    <nav className="fixed left-4 top-1/2 z-50 flex w-14 -translate-y-1/2 flex-col items-center gap-6 rounded-2xl bg-zinc-50/90 py-4 shadow-2xl shadow-zinc-200/50 backdrop-blur-2xl">
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          tool={tool}
          onClick={() => handleToolSelect(tool.id)}
        />
      ))}

      <ColorPalette
        swatches={colorSwatches}
        onColorSelect={handleColorSelect}
      />
      {/* 
      <div className="my-1 h-[2px] w-8 rounded-full bg-zinc-200" />

      <button
        onClick={handleClear}
        className="group relative flex items-center justify-center rounded-xl p-2.5 text-zinc-500 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-500 active:scale-95"
      >
        <Trash2 className="h-5 w-5" />
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          Delete
        </span>
      </button> */}
    </nav>
  )
}

// Made with Bob
