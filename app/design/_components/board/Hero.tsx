type HeroProps = {
  userName: string
}

export function Hero({ userName }: HeroProps) {
  return (
    <div className="mb-10">
      <h1 className="mb-2 text-4xl font-black tracking-tight text-zinc-900">
        {userName}'s Boards
      </h1>
      <p className="text-base text-zinc-600">
        All your designs, organized and accessible
      </p>
    </div>
  )
}

// Made with Bob
