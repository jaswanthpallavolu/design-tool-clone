import Link from "next/link"

export default function Home() {
  return (
    <div className="m-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Design Tool</h1>
      <p className="text-gray-600 mb-8">
        Choose an editor to start creating your designs
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* VanillaJS Engine Card */}
        <Link
          href="/vanilla-app/index.html"
          className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            VanillaJS Engine
          </h2>
          <p className="text-gray-600 text-sm">
            A lightweight canvas editor built with pure JavaScript. Perfect for
            understanding the core concepts without framework overhead.
          </p>
        </Link>

        {/* New Design Card */}
        <Link
          href="/design"
          className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            Open design board
          </h2>
          <p className="text-gray-600 text-sm">
            Access the design board where you can create designs and collaborate
            with others in real-time.
          </p>
        </Link>
      </div>
    </div>
  )
}
