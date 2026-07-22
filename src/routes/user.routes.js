import { Router } from "express"
import { requestHandler } from "../controllers/user.controller.js"

const userRouter = Router()
userRouter.route('/register').post(requestHandler)

export {userRouter}