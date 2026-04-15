import { TopBar } from "./design-editor/TopBar"
import { Canvas } from "./design-editor/Canvas"
import { Sidebar } from "./design-editor/Sidebar"
import { MetadataPanel } from "./design-editor/MetadataPanel"

export default function DesignEditorPage({ id }: { id: string }) {
  const boardName = `Board ${id.slice(0, 8)}`

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/20 text-zinc-900 selection:bg-blue-500/20">
      <TopBar boardName={boardName} />
      <Canvas />
      <Sidebar />
      <MetadataPanel />
    </div>
  )
}

// Made with Bob
