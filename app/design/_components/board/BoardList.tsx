import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Board } from "./types"
import type { DesignWithCollaborators, Collaborator } from "@/app/types"
import { CollaboratorAvatar } from "./CollaboratorAvatar"
import { getUserGradientClass } from "../../../utils/userGradient"

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

function BoardRow({
  board,
  onDelete,
}: {
  board: DesignWithCollaborators
  onDelete: (id: string) => void
}) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div
      className="group grid cursor-pointer grid-cols-12 items-center gap-4 border-b border-zinc-100/50 bg-white/50 px-5 py-3 transition-all duration-200 last:border-0 hover:bg-zinc-50"
      onClick={() => router.push(`/design/${board.id}`)}
    >
      <div className="col-span-4 md:col-span-5">
        <span className="truncate text-sm font-semibold text-zinc-900">
          {board.title || "Untitled Design"}
        </span>
      </div>

      <div className="col-span-2 text-xs text-zinc-500">
        {formatDate(board.createdAt)}
      </div>

      <div className="col-span-2 flex -space-x-1.5">
        {board.collaborators?.map((collaborator: Collaborator) => (
          <CollaboratorAvatar
            key={`${board.id}-${collaborator.userId}`}
            initials={
              collaborator.user?.name?.substring(0, 2).toUpperCase() || "??"
            }
            gradientClassName={getUserGradientClass(
              collaborator.user?.name || "User",
            )}
          />
        ))}
      </div>

      <div className="col-span-3 text-right text-xs text-zinc-500 md:col-span-2">
        {formatDate(board.updatedAt)}
      </div>

      <div className="col-span-1 text-right">
        <button
          className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="Delete"
          aria-label={`Delete ${board.title || "design"}`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(board.id)
          }}
        >
          <Trash2 className="ml-auto h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b border-zinc-100/50 bg-white/50 px-5 py-3">
      <div className="col-span-4 md:col-span-5">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-300" />
      </div>
      <div className="col-span-2">
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-300" />
      </div>
      <div className="col-span-2 flex -space-x-1.5">
        <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-300" />
      </div>
      <div className="col-span-3 md:col-span-2">
        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-zinc-300" />
      </div>
      <div className="col-span-1" />
    </div>
  )
}

type BoardListProps = {
  designs: DesignWithCollaborators[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function BoardList({ designs, isLoading, onDelete }: BoardListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/50 bg-white/80 shadow-xl backdrop-blur-sm">
      <BoardListHeader />
      {isLoading ? (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      ) : designs.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-zinc-500">
          No designs yet. Create your first board to get started!
        </div>
      ) : (
        designs.map((board) => (
          <BoardRow key={board.id} board={board} onDelete={onDelete} />
        ))
      )}
    </div>
  )
}

// Made with Bob
