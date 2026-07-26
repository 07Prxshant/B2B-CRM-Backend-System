import { Router } from "express"
import { loginUser, logoutUser, registerAdmin, refreshAccessToken, getCurrentUser, updatePassword} from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(upload.none(),registerAdmin)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/me').get(verifyJWT, getCurrentUser)

router.route('/update-password').patch(verifyJWT, updatePassword)


export default router
