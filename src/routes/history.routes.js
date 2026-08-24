import { Router } from 'express'
import { leadHistory } from "../controllers/history.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const historyRouter = Router()

historyRouter.route('/:id/history').get(verifyJWT,leadHistory)

export default historyRouter