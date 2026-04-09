"use client"
import { useEffect } from "react"
import { io } from "socket.io-client"

export default function DesignCanvas({ id }: { id: string }) {
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      query: { roomId: id },
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  return <div>DesignCanvas</div>
}
