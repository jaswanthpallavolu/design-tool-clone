import type { Board, User } from "./types"

export const boards: Board[] = [
  {
    id: "mobile-app-wireframes",
    name: "Mobile App Wireframes",
    createdAt: "Oct 12, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
      { initials: "AS", gradientClassName: "from-purple-400 to-purple-600" },
    ],
    lastActivity: "Updated 2h ago",
  },
  {
    id: "client-brand-concepts",
    name: "Client Brand Concepts",
    createdAt: "Oct 10, 2023",
    collaborators: [
      { initials: "MK", gradientClassName: "from-green-400 to-green-600" },
    ],
    lastActivity: "Updated 5h ago",
  },
  {
    id: "quick-sketch-ideas",
    name: "Quick Sketch Ideas",
    createdAt: "Oct 05, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
      { initials: "TL", gradientClassName: "from-orange-400 to-orange-600" },
      { initials: "+2", gradientClassName: "from-zinc-400 to-zinc-600" },
    ],
    lastActivity: "Updated 1d ago",
  },
  {
    id: "user-flow-diagram",
    name: "User Flow Diagram",
    createdAt: "Sep 28, 2023",
    collaborators: [
      { initials: "BW", gradientClassName: "from-pink-400 to-pink-600" },
    ],
    lastActivity: "Updated 3d ago",
  },
  {
    id: "meeting-notes-july-24",
    name: "Meeting Notes (July 24)",
    createdAt: "Jul 24, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
      { initials: "PR", gradientClassName: "from-teal-400 to-teal-600" },
    ],
    lastActivity: "Updated 4d ago",
  },
  {
    id: "calligraphy-practice",
    name: "Calligraphy Practice",
    createdAt: "Jul 20, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
    ],
    lastActivity: "Updated 1w ago",
  },
  {
    id: "geometric-pattern-studies",
    name: "Geometric Pattern Studies",
    createdAt: "Jul 15, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
      { initials: "AS", gradientClassName: "from-purple-400 to-purple-600" },
    ],
    lastActivity: "Updated 2w ago",
  },
  {
    id: "landscape-backgrounds",
    name: "Landscape Backgrounds",
    createdAt: "Jul 10, 2023",
    collaborators: [
      { initials: "JD", gradientClassName: "from-blue-400 to-blue-600" },
    ],
    lastActivity: "Updated 3w ago",
  },
]

export const initialUsers: User[] = [
  {
    id: "alexander-wright",
    name: "Alexander Wright",
    lastActive: "Last active 2h ago",
    gradientClassName: "from-blue-400 to-blue-600",
    isActive: true,
  },
  {
    id: "elena-rossi",
    name: "Elena Rossi",
    lastActive: "Last active 1d ago",
    gradientClassName: "from-purple-400 to-purple-600",
  },
  {
    id: "marcus-thorne",
    name: "Marcus Thorne",
    lastActive: "Last active 3d ago",
    gradientClassName: "from-orange-400 to-orange-600",
  },
]

// Made with Bob
