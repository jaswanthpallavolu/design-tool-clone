import { Router } from "express"
import userRouter from "./user"
import designRouter from "./design"
import healthRouter from "./health"

const router = Router()

router.use("/users", userRouter)
router.use("/designs", designRouter)
router.use("/health", healthRouter)

export default router
