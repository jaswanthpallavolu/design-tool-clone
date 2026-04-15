import { Trash2 } from "lucide-react"
import type { Board } from "./types"
import { CollaboratorAvatar } from "./CollaboratorAvatar"
import { boards } from "./constants"

function BoardListHeader() {
  return (
    <div className="grid grid-cols-12 gap-4 border-b border-zinc-200/50 bg-zinc-50/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
      <div className="col-span-4 md:col-span-5">Board Name</div>
      <div className="col-span-2 text-left">Created At</div>
      <div className="col-span-2 text-left">Collaborators</div>
      <div className="col-span-3 text-right md:col-span-2">Last Activity</div>
      <div className="col-span-1 text-right">Actions</div>
    </div>
  )
}

function BoardRow({ board }: { board: Board }) {
  return (
    <div className="group grid cursor-pointer grid-cols-12 items-center gap-4 border-b border-zinc-100/50 bg-white/50 px-5 py-3 transition-all duration-200 last:border-0 hover:bg-zinc-50">
      <div className="col-span-4 md:col-span-5">
        <span className="truncate text-sm font-semibold text-zinc-900">
          {board.name}
        </span>
      </div>

      <div className="col-span-2 text-xs text-zinc-500">{board.createdAt}</div>

      <div className="col-span-2 flex -space-x-1.5">
        {board.collaborators.map((collaborator) => (
          <CollaboratorAvatar
            key={`${board.id}-${collaborator.initials}`}
            initials={collaborator.initials}
            gradientClassName={collaborator.gradientClassName}
          />
        ))}
      </div>

      <div className="col-span-3 text-right text-xs text-zinc-500 md:col-span-2">
        {board.lastActivity}
      </div>

      <div className="col-span-1 text-right">
        <button
          className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="Delete"
          aria-label={`Delete ${board.name}`}
        >
          <Trash2 className="ml-auto h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function BoardList() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/50 bg-white/80 shadow-xl backdrop-blur-sm">
      <BoardListHeader />
      {boards.map((board) => (
        <BoardRow key={board.id} board={board} />
      ))}
    </div>
  )
}

// Made with Bob
