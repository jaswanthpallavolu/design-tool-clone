/**
 * Generates a consistent gradient class name based on a user's name
 * Uses a hash of the name to deterministically select from predefined gradients
 */
export function getUserGradientClass(userName: string): string {
  // Vibrant gradient combinations with better visual appeal
  const gradients = [
    "from-purple-600 via-pink-500 to-red-500",
    "from-blue-600 via-cyan-500 to-teal-400",
    "from-indigo-600 via-purple-500 to-pink-500",
    "from-green-500 via-emerald-500 to-teal-600",
    "from-orange-500 via-red-500 to-pink-600",
    "from-yellow-400 via-orange-500 to-red-600",
    "from-pink-500 via-rose-500 to-red-600",
    "from-cyan-400 via-blue-500 to-indigo-600",
    "from-lime-400 via-green-500 to-emerald-600",
    "from-fuchsia-500 via-purple-600 to-indigo-600",
    "from-amber-400 via-orange-500 to-red-500",
    "from-sky-400 via-blue-500 to-violet-600",
    "from-rose-400 via-pink-500 to-purple-600",
    "from-teal-400 via-cyan-500 to-blue-600",
    "from-violet-500 via-purple-600 to-fuchsia-600",
    "from-emerald-400 via-teal-500 to-cyan-600",
    "from-red-500 via-rose-500 to-pink-600",
    "from-blue-500 via-indigo-600 to-purple-700",
    "from-green-400 via-lime-500 to-yellow-500",
    "from-orange-400 via-amber-500 to-yellow-500",
  ]

  // Simple hash function to convert name to a number
  const hash = userName.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  // Use absolute value and modulo to get a consistent index
  const index = Math.abs(hash) % gradients.length

  return gradients[index]
}

// Made with Bob
