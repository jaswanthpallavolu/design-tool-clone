import Canvas from "./Canvas"
export function EditorWorkspace() {
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
        <Canvas />
      </div>
    </main>
  )
}

// Made with Bob
