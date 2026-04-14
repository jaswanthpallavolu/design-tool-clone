import { Server } from "socket.io"
import { Server as HTTPServer } from "http"

const roomUsers = new Map<string, Set<string>>()

export const initSockets = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    const { roomId, clientId } = socket.handshake.query

    if (
      roomId &&
      typeof roomId === "string" &&
      clientId &&
      typeof clientId === "string"
    ) {
      socket.join(roomId)
      console.log(`User connected to room: ${roomId}`)
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set<string>())
      }
      roomUsers.get(roomId)?.add(clientId)

      io.to(roomId).emit("user-count", roomUsers.get(roomId)?.size)

      socket.on("cursor-move", (data) => {
        socket.to(roomId).emit("cursor-move", {
          clientId,
          x: data.x,
          y: data.y,
        })
      })
    }

    // // Handle drawing events
    // socket.on("draw-shape", (data) => {
    //   // Broadcast to everyone else in the room
    //   if (roomId) socket.to(roomId).emit("draw-shape", data)
    // })

    socket.on("disconnect", () => {
      console.log("User disconnected ", clientId)
    })
  })
}
