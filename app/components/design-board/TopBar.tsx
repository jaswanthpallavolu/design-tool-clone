import { ChevronDown, LayoutDashboard, User } from "lucide-react"
import type { User as UserType } from "./types"
import { useRouter } from "next/navigation"

type TopBarProps = {
  activeUser: UserType
  onOpenSwitchUser: () => void
}

export function TopBar({ activeUser, onOpenSwitchUser }: TopBarProps) {
  const router = useRouter()
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-200/50 bg-white/70 px-8 shadow-sm backdrop-blur-2xl">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-700">
          <LayoutDashboard className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">
          Design Board
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSwitchUser}
          className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-600 transition-all duration-200 hover:bg-zinc-100/50 hover:text-zinc-900 active:scale-95"
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${activeUser.gradientClassName}`}
          >
            <User className="h-4 w-4 text-white" />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-zinc-900">
              {activeUser.name}
            </span>
            <span className="text-[10px] text-zinc-500">Switch User</span>
          </div>

          <ChevronDown className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600" />
        </button>

        <button
          className="rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-2 text-sm font-semibold text-zinc-50 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          onClick={() => router.push("/design/23veAkg7hw")}
        >
          Create Board
        </button>
      </div>
    </header>
  )
}

// Made with Bob
