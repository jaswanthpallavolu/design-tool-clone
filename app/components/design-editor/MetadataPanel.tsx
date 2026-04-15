export function MetadataPanel() {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 rounded-xl border border-zinc-200/50 bg-white/70 px-3 py-2 text-xs font-medium text-zinc-600 shadow-lg backdrop-blur-xl transition-all duration-300 hover:text-zinc-900">
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider">Pos:</span>
        <span className="font-mono">1024, 768</span>
      </div>
      <div className="h-4 w-[1px] bg-zinc-300" />
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider">Zoom:</span>
        <span className="font-mono">100%</span>
      </div>
      <div className="h-4 w-[1px] bg-zinc-300" />
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider">Grid:</span>
        <span className="font-mono">Active</span>
      </div>
    </div>
  )
}

// Made with Bob
