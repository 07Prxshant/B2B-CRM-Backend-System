import { Router } from 'express'
import {
    createLead,
    getAllLeads,
    getLead,
    updateLead,
    assignLead,
    deleteLead
} from "../controllers/lead.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyAdmin } from "../middlewares/admin.middleware.js"

const leadRouter = Router()

leadRouter.route('/')
.post(verifyJWT,createLead)
.get(verifyJWT,getAllLeads)

leadRouter.route('/:id')
.get(verifyJWT,getLead)
.patch(verifyJWT,updateLead)

leadRouter.route('/:id/assign').patch(verifyJWT,assignLead)

leadRouter.route('/:id/delete').post(verifyJWT,deleteLead)

export default leadRouter