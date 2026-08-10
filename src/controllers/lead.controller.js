import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Lead from "../models/lead.model.js"
import Company from "../models/company.model.js"
import User from "../models/user.model.js"
import History from "../models/history.model.js"

const createLead = asyncHandler(async (req, res)=>{
    const createdBy = req.user._id
    const organizationId = req.user.organizationId
    const {companyId, assignedTo, firstName, lastName, email, phone} = req.body
    if (!organizationId || !companyId || !assignedTo){
        throw new ApiError(400,'Fill mandatory fields')
    }

    const company = await Company.findOne({
        _id: companyId,
        organizationId: req.user.organizationId
    })
    if(!company){
        throw new ApiError(404,'Company not found')
    }

    if (company.isActive !== true){
        throw new ApiError(400, 'Company is inactive')
    }

    const user = await User.findOne({
        _id: assignedTo,
        organizationId: req.user.organizationId
    })
    if(!user){
        throw new ApiError(404,'User not found')
    }

    if (user.isActive !== true){
        throw new ApiError(400, 'User is inactive')
    }

    const lead = await Lead.create({
        organizationId,
        companyId,
        assignedTo,
        createdBy,
        firstName,
        lastName,
        email,
        phone,
    })

    const history = await History.create({
        organizationId,
        leadId : lead._id,
        performedBy: createdBy,
        eventType: 'LEAD_CREATED',
        description: `Lead created by ${req.user._id}`
    })

    return res.status(201)
    .json(new ApiResponse(201,lead,'Lead created successfully'))
})

export {}