import { Router } from "express";
import { createCompany, getAllCompanies, getCompany, updateCompany, deleteCompany} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const companyRouter = Router()

companyRouter.route('/')
.post(verifyJWT, createCompany)
.get(verifyJWT, getAllCompanies)

companyRouter.route('/:id')
.get(verifyJWT, getCompany)
.patch(verifyJWT,verifyAdmin, updateCompany)
.delete(verifyJWT, verifyAdmin, deleteCompany)

export default companyRouter