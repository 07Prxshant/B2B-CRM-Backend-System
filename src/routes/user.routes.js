import { Router } from "express"
import { loginUser, logoutUser, registerAdmin } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route('/register').post(
    upload.none(),
    registerAdmin)


router.route('/login').post(loginUser)


router.route('/logout').post(verifyJWT, logoutUser)

export default router
