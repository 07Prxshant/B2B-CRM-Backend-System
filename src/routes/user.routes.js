import { Router } from "express"
import { registerAdmin } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const authRouter = Router()
authRouter.route('/register').post(
    upload.none(),
    registerAdmin)

export {authRouter}