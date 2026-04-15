export function getGradientClassName(index: number): string {
  const gradients = [
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600",
    "from-teal-400 to-teal-600",
    "from-pink-400 to-pink-600",
    "from-green-400 to-green-600",
  ]

  return gradients[index % gradients.length]
}

// Made with Bob
