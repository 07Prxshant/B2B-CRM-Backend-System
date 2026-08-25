import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Lead from "../models/lead.model.js"
import Company from "../models/company.model.js"
import User from "../models/user.model.js"
import History from "../models/history.model.js"
import { tr } from "framer-motion/client";
import { startSession } from "mongoose";
import { statsBuffer } from "framer-motion";
import { selectAnyCartesianItemsUsesChartData } from "recharts/types/state/selectors/axisSelectors.js";

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

    await History.create({
        organizationId,
        leadId : lead._id,
        performedBy: createdBy,
        eventType: 'LEAD_CREATED',
        description: `Lead created by ${req.user._id}`
    })

    return res.status(201)
    .json(new ApiResponse(201,lead,'Lead created successfully'))
})

const getAllLeads = asyncHandler(async(req, res)=>{
    const {
        search,
        companyId,
        assignedTo,
        createdBy,
        status,
        isActive,
        createdFrom,
        createdTo,
        sortBy,
        sortOrder,
        page,
        limit
    } = req.query

    const query = {
        organizationId:req.user.organizationId
    }

    if (search) {
        query.$or = [
            {
                firstName: {
                    $regex:search,
                    $options:"i"
                }
            },

            {    lastName: {
                    $regex:search,
                    $options:"i"
                }
            },
            {    email: {
                    $regex:search,
                    $options:"i"
                }
            },
            {    phone: {
                    $regex:search,
                    $options:"i"
                }
            }
        ]
    }

    if (companyId){
        query.companyId = companyId
    }
    if (assignedTo){
        query.assignedTo = assignedTo
    }
    if (createdBy){
        query.createdBy = createdBy
    }
    if (status){
        query.status = status
    }
    if (isActive !== undefined){
        query.isActive = isActive === 'true'
    }
    if (createdFrom || createdTo){
        query.createdAt = {}

        if (createdFrom) {
            query.createdAt.$gte = new Date(createdFrom)
        }
        if (createdTo) {
            query.createdAt.$lte = new Date(createdTo)
        }
    }

    const allowedSortFields = [
        "firstName",
        "lastName",
        "createdAt",
        "updatedAt",
        "status"
    ]
    const sort = {}

    if (sortBy && allowedSortFields.includes(sortBy)){
        sort[sortBy] = sortOrder === "asc" ? 1 : -1
    }
    else {
        sort.createdAt = -1;
    }

    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10
    const skip = (pageNumber - 1)* limitNumber
    const totalLeads = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalLeads / limitNumber);

    const leads = await Lead.find(query)
    .populate("companyId","name")
    .populate("assignedTo","firstName lastName email")
    .populate("createdBy","firstName lastName email")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)

    return res.status(200)
    .json(new ApiResponse(
        200, 
        {
            leads,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalLeads,
                totalPages
            }
        }, 
        'All leads fetched successfully'))
})

const getLead = asyncHandler(async(req ,res)=>{
    const {id} = req.params
    const lead = await Lead.findOne({
        _id:id,
        organizationId: req.user.organizationId,
        isActive:true
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    return res.status(200)
    .json(new ApiResponse(200, lead,'Lead fetched successfully'))
})

const updateLead = asyncHandler(async(req,res)=>{
    const {id} = req.params
    const {status} = req.body
    const validStatus = [
            'NEW',
            'CONTACTED',
            'DEMO_SCHEDULED',
            'NEGOTIATION',
            'WON',
            'LOST',
        ]
    if (!validStatus.includes(status)){
        throw new ApiError(400,'Invalid status')
    }

    const lead = await Lead.findOne({
        _id:id,
        organizationId:req.user.organizationId,
        isActive:true
    })

    if (!lead){
        throw new ApiError(404,'Lead not found')
    }

    const oldStatus = lead.status
    if (oldStatus === status){
        throw new ApiError(400,'Lead already have this status')
    }
    lead.status = status
    await lead.save()
    
    await History.create({
        organizationId: req.user.organizationId,
        leadId : lead._id,
        performedBy: req.user._id,
        eventType: 'STATUS_CHANGED',
        description: `Lead status changed from ${oldStatus} to ${status}`
    })

    return res.status(200)
    .json(new ApiResponse(200, lead, 'Lead status updated successfully'))
})

const assignLead = asyncHandler(async(req, res)=>{
    const {id} = req.params
    const {assignedTo} = req.body

    if (!assignedTo){
        throw new ApiError(400,'Assigned user is required')
    }

    const lead = await Lead.findOne({
        _id:id,
        organizationId: req.user.organizationId,
        isActive:true
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    if (lead.assignedTo.toString() === assignedTo) {
        throw new ApiError(400, 'Lead is already assigned to this user')
    }

    const user = await User.findOne({
        _id:assignedTo,
        organizationId: req.user.organizationId
    })

    if (!user){
        throw new ApiError(404,'Assinged user not found');
    }

    if (user.isActive !== true){
        throw new ApiError(400,'Assinged user is inactive');
    }

    const oldAssignedTo = lead.assignedTo

    lead.assignedTo = assignedTo
    await lead.save()

    await History.create({
        organizationId:req.user.organizationId,
        leadId : lead._id,
        performedBy: req.user._id,
        eventType: 'LEAD_ASSIGNED',
        description: `Lead reassigned from ${oldAssignedTo} to ${assignedTo}`
    })

    return res.status(200)
    .json(new ApiResponse(200,lead,'New user lead successfully assigned'))

})

const deleteLead = asyncHandler(async(req, res)=>{
    const {id} = req.params
    const lead = await Lead.findOne({
        _id:id,
        organizationId: req.user.organizationId,
        isActive:true
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    lead.isActive = false
    await lead.save()

    await History.create({
        organizationId: req.user.organizationId,
        leadId : lead._id,
        performedBy: req.user._id,
        eventType: 'LEAD_DELETED',
        description: `Lead deleted successfully`
    })

    return res.status(200)
    .json(new ApiResponse(200,lead,'Lead deleted successfully'))
})

export {
    createLead,
    getAllLeads,
    getLead,
    updateLead,
    assignLead,
    deleteLead
}