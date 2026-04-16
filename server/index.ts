import cors from "cors"
import express from "express"
import http from "http"
import apiRoutes from "./routes"
import { initSockets } from "./sockets"
import { errorHandler } from "./middleware/errorHandler"

const app = express()
// Enable CORS so your Next.js app (on port 3000) can talk to this server
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }),
)

const server = http.createServer(app)

initSockets(server)

app.use(express.json())

// Mount all API routes
app.use("/api", apiRoutes)

// Error handling middleware (must be after all routes)
app.use(errorHandler)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
