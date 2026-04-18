import type { Collaborator } from "./types"

export function CollaboratorAvatar({
  initials,
  gradientClassName,
}: Collaborator) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[9px] font-bold text-white shadow-sm ${gradientClassName}`}
    >
      {initials}
    </div>
  )
}

// Made with Bob
