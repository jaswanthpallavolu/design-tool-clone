import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-8 py-20">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
            Canvas Graphics Editor
          </h1>
          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
            A browser-based graphics editor built on a framework-agnostic engine.
            One pure TypeScript core. Two independent UI implementations.
          </p>
        </div>

        {/* Engine highlight */}
        <div className="mb-12 rounded-xl border border-zinc-200 bg-zinc-50 px-7 py-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Core Engine
          </p>
          <h2 className="text-lg font-semibold text-zinc-800 mb-2">
            Framework-agnostic editor engine
          </h2>

          <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
            A pure TypeScript engine with a retained-mode scene graph of shapes,
            transformed via the Command pattern and rendered through pluggable
            adapters — completely independent of the HTML5 Canvas API or any UI
            framework.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "Ports & Adapters",
              "Command Pattern",
              "State Machines",
              "Event-Driven",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Implementations */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Implementations
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Vanilla JS */}
          <Link
            href="/vanilla-app/index.html"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-800">
                Vanilla JavaScript
              </h3>
              <span className="text-[10px] font-medium text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5">
                Minimal
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Raw engine integration with no framework. Direct HTML5 Canvas
              adapter, no build step, no dependencies.
            </p>
            <span className="text-xs font-medium text-zinc-800 group-hover:underline">
              Open →
            </span>
          </Link>

          {/* Next.js App */}
          <Link
            href="/design"
            className="group rounded-xl border border-amber-200 bg-amber-50/40 p-6 transition-all hover:border-amber-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-800">
                Next.js App
              </h3>
              <span className="text-[10px] font-medium text-amber-600 border border-amber-200 bg-amber-50 rounded px-1.5 py-0.5">
                In Progress
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Production-grade React app on the same engine. Real-time
              collaboration via Socket.IO, auth, and persistent storage.
            </p>
            <span className="text-xs font-medium text-zinc-800 group-hover:underline">
              Open →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
