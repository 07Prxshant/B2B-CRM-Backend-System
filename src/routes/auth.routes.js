import { Router } from "express"
import { loginUser, logoutUser, registerAdmin, refreshAccessToken, getCurrentUser, updatePassword} from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router()

authRouter.route('/register').post(upload.none(),registerAdmin)

authRouter.route('/login').post(loginUser)

authRouter.route('/logout').post(verifyJWT, logoutUser)

authRouter.route('/refresh-token').post(refreshAccessToken)

authRouter.route('/me').get(verifyJWT, getCurrentUser)

authRouter.route('/update-password').patch(verifyJWT, updatePassword)


export default authRouter
