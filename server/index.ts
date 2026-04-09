import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
// Enable CORS so your Next.js app (on port 3000) can talk to this server
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }),
)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  const { roomId } = socket.handshake.query

  if (roomId) {
    socket.join(roomId)
    console.log(`User connected to room: ${roomId}`)
  }

  // Handle drawing events
  socket.on("draw-shape", (data) => {
    // Broadcast to everyone else in the room
    if (roomId) socket.to(roomId).emit("draw-shape", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected")
  })
})

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Socket BFF running on http://localhost:${PORT}`)
})
