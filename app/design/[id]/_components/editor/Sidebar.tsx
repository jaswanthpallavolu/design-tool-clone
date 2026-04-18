import { Trash2 } from "lucide-react"
import type { Tool, ColorSwatch } from "./types"
import { tools, colorSwatches } from "./constants"

function ToolButton({ tool }: { tool: Tool }) {
  const Icon = tool.icon

  if (tool.isActive) {
    return (
      <button className="group relative flex flex-col items-center justify-center text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95">
        <span className="absolute right-0 h-4 w-0.5 bg-blue-600" />
        <Icon
          className="h-5 w-5"
          strokeWidth={tool.id === "select" ? 2.4 : 2}
        />
        <span className="mt-1 text-[10px] font-medium uppercase tracking-tighter opacity-0 transition-opacity group-hover:opacity-100">
          {tool.label}
        </span>
      </button>
    )
  }

  return (
    <button className="group relative flex items-center justify-center rounded-lg p-2 text-zinc-500 transition-all duration-200 hover:scale-110 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95">
      <Icon className="h-5 w-5" />
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {tool.label}
      </span>
    </button>
  )
}

function ColorPalette() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
      {colorSwatches.map((swatch: ColorSwatch) => (
        <div
          key={swatch.id}
          className={`cursor-pointer bg-gradient-to-br shadow-md transition-transform hover:scale-125 ${
            swatch.isActive ? "h-5 w-5 rounded-md" : "h-6 w-6 rounded-lg"
          } ${swatch.className}`}
        />
      ))}
    </div>
  )
}

export function Sidebar() {
  return (
    <nav className="fixed left-4 top-1/2 z-50 flex w-14 -translate-y-1/2 flex-col items-center gap-6 rounded-2xl bg-zinc-50/90 py-4 shadow-2xl shadow-zinc-200/50 backdrop-blur-2xl">
      {tools.map((tool) => (
        <ToolButton key={tool.id} tool={tool} />
      ))}

      <ColorPalette />

      <div className="my-1 h-[2px] w-8 rounded-full bg-zinc-200" />

      <button className="group relative flex items-center justify-center rounded-xl p-2.5 text-zinc-500 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-500 active:scale-95">
        <Trash2 className="h-5 w-5" />
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          Delete
        </span>
      </button>
    </nav>
  )
}

// Made with Bob
