"use client"
import { TopBar } from "./editor/TopBar"
import { EditorWorkspace } from "./editor/EditorWorkspace"
import { Sidebar } from "./editor/Sidebar"
// import { MetadataPanel } from "./editor/MetadataPanel"
import { useGetDesignQuery } from "@/app/features/designs/design.queries"

export default function DesignEditorPage({ id }: { id: string }) {
  const { data: design, isPending } = useGetDesignQuery({ id })

  if (isPending || !design) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/20">
        <div className="text-zinc-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/20 text-zinc-900 selection:bg-blue-500/20">
      <TopBar boardName={design.title} designId={id} />
      <EditorWorkspace />
      <Sidebar />
      {/* <MetadataPanel /> */}
    </div>
  )
}

// Made with Bob
