function SelectionPreview() {
  return (
    <div className="absolute left-1/3 top-1/4 h-40 w-64 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 shadow-lg transition-shadow hover:shadow-xl">
      <div className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nw-resize rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-md transition-transform hover:scale-150" />
      <div className="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-ne-resize rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-md transition-transform hover:scale-150" />
      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 cursor-sw-resize rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-md transition-transform hover:scale-150" />
      <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-md transition-transform hover:scale-150" />
    </div>
  )
}

function Tooltip() {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-xl border border-zinc-700 bg-gradient-to-r from-zinc-900 to-zinc-800 px-4 py-2 text-xs font-medium tracking-tight text-white opacity-0 shadow-2xl transition-opacity hover:opacity-100">
      Press <kbd className="rounded bg-white/20 px-2 py-0.5 font-bold">V</kbd>{" "}
      for Select •{" "}
      <kbd className="rounded bg-white/20 px-2 py-0.5 font-bold">R</kbd> for
      Rectangle
    </div>
  )
}

export function Canvas() {
  return (
    <main className="relative flex h-full w-full items-center justify-center pt-14">
      <div
        className="relative h-full w-full bg-white/40 shadow-inner backdrop-blur-sm"
        style={{
          backgroundImage:
            "radial-gradient(rgb(209, 213, 219) 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      >
        <canvas className="absolute h-full w-full bg-blue-100/20" />
      </div>
    </main>
  )
}

// Made with Bob
