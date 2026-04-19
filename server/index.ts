import cors from "cors"
import express from "express"
import http from "http"
import apiRoutes from "./routes/index.js"
import { initSockets } from "./sockets/index.js"
import { errorHandler } from "./middleware/errorHandler.js"

const app = express()

app.use(express.json())

// Enable CORS so your Next.js app can talk to this server
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

const server = http.createServer(app)

initSockets(server)

// Mount all API routes
app.use("/api", apiRoutes)

// Error handling middleware (must be after all routes)
app.use(errorHandler)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
