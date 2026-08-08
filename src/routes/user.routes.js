import { Router } from "express";
import { createUser, getAllUsers, getUser, updateUserbyAdmin, selfUserUpdate } from "../controllers/user.controller.js";
import { verifyJWT} from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js"

const userRouter = Router()

userRouter.route('/')
.post(verifyJWT, verifyAdmin, createUser)
.get(verifyJWT, verifyAdmin, getAllUsers)

userRouter.route('/me').patch(verifyJWT, selfUserUpdate)

userRouter.route('/:id')
.get(verifyJWT, verifyAdmin, getUser)
.patch(verifyJWT, verifyAdmin, updateUserbyAdmin)

export default userRouter