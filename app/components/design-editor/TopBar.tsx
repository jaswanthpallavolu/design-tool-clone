import { Edit3, Share2, Home } from "lucide-react"
import Link from "next/link"

type TopBarProps = {
  boardName: string
}

export function TopBar({ boardName }: TopBarProps) {
  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-200/30 bg-white/60 px-6 shadow-sm backdrop-blur-2xl">
      <div className="flex items-center gap-2">
        <button
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100/50 hover:text-zinc-600"
          aria-label="Go to home"
        >
          <Link href={"/design"}>
            <Home className="h-4 w-4" />
          </Link>
        </button>
        <input
          type="text"
          value={boardName}
          readOnly
          placeholder="Board name..."
          className="cursor-text rounded bg-transparent px-2 py-1 text-base font-semibold tracking-wide text-zinc-900 transition-all outline-none hover:bg-zinc-100/50"
        />
        <button className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-600">
          <Edit3 className="h-4 w-4" />
        </button>
      </div>

      <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-600 transition-all duration-200 hover:bg-zinc-100/50 hover:text-zinc-900 active:scale-95">
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Share</span>
      </button>
    </header>
  )
}

// Made with Bob
