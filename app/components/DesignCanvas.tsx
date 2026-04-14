"use client"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { nanoid } from "nanoid"

export default function DesignCanvas({ id }: { id: string }) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  const socketRef = useRef<Socket | null>(null)
  const [isSocketReady, setIsSocketReady] = useState(false)

  const getClientId = () => {
    let clientId = localStorage.getItem("clientId")
    if (!clientId) {
      clientId = `client_${Date.now()}_${nanoid()}`
      localStorage.setItem("clientId", clientId)
    }
    return clientId
  }

  useEffect(() => {
    const newSocket = io(socketUrl, {
      query: { roomId: id, clientId: getClientId() },
    })

    socketRef.current = newSocket

    newSocket.on("connect", () => {
      setIsSocketReady(true)
    })

    newSocket.on("user-count", (count) => {
      console.log("user-count", count)
    })

    return () => {
      setIsSocketReady(false)
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [id])

  return (
    <div className="p-4 relative w-full h-[80vh] pointer-events-none">
      <div className="absolute inset-0 p-4">
        <Canvas socketRef={socketRef} />
      </div>
      <div className="absolute inset-0 p-4 ">
        <CursorOverlay socketRef={socketRef} isSocketReady={isSocketReady} />
      </div>
    </div>
  )
}

function Canvas({ socketRef }: { socketRef: React.RefObject<Socket | null> }) {
  return (
    <canvas
      onMouseMove={(e) => {
        const x = e.clientX
        const y = e.clientY
        socketRef.current?.emit("cursor-move", { x, y })
      }}
      className="w-full h-full bg-green-100 pointer-events-auto"
    />
  )
}

function CursorOverlay({
  socketRef,
  isSocketReady,
}: {
  socketRef: React.RefObject<Socket | null>
  isSocketReady: boolean
}) {
  const [userCursors, setUserCursors] = useState<
    Record<string, { x: number; y: number }>
  >({})

  useEffect(() => {
    if (!isSocketReady) return

    const socket = socketRef.current
    if (!socket) return

    const handleCursorMove = (data: {
      clientId: string
      x: number
      y: number
    }) => {
      const { clientId, x, y } = data
      setUserCursors((prev) => ({ ...prev, [clientId]: { x, y } }))
    }

    socket.on("cursor-move", handleCursorMove)

    return () => {
      socket.off("cursor-move", handleCursorMove)
    }
  }, [isSocketReady, socketRef])

  return (
    <div className="w-full h-full bg-red-100">
      {Object.entries(userCursors).map(([clientId, position]) => (
        <Cursor
          key={clientId}
          clientId={clientId}
          x={position.x}
          y={position.y}
        />
      ))}
    </div>
  )
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}

function Cursor({
  clientId,
  x,
  y,
}: {
  clientId: string
  x: number
  y: number
}) {
  const color = stringToColor(clientId)
  return (
    <div
      className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-[left,top] duration-0"
      style={{ left: x, top: y, backgroundColor: color }}
    >
      <span
        className="absolute top-4 left-4 text-xs text-white px-2 py-1 rounded whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {clientId.slice(0, 8)}
      </span>
    </div>
  )
}
