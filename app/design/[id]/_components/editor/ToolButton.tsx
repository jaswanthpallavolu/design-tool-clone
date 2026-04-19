import type { Tool } from "./types"

export function ToolButton({
  tool,
  onClick,
}: {
  tool: Tool
  onClick: () => void
}) {
  const Icon = tool.icon

  if (tool.isActive) {
    return (
      <button
        onClick={onClick}
        className="group relative flex items-center justify-center rounded-lg p-2 text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95"
      >
        <span className="absolute right-0 h-4 w-0.5 bg-blue-600" />
        <Icon
          className="h-5 w-5"
          strokeWidth={tool.id === "select" ? 2.4 : 2}
        />
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          {tool.label}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center rounded-lg p-2 text-zinc-500 transition-all duration-200 hover:scale-110 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
    >
      <Icon className="h-5 w-5" />
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {tool.label}
      </span>
    </button>
  )
}

// Made with Bob
