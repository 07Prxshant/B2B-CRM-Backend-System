import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Deal from "../models/deal.model.js"
import Lead from "../models/lead.model.js"
import History from "../models/history.model.js"
import { createTailwindMerge } from "tailwind-merge"


const createDeal = asyncHandler(async(req,res) => {
    const { leadId } = req.params
    const lead = await Lead.findOne({
        _id:leadId,
        organizationId:req.user.organizationId
    })
    if (!lead){
        throw new ApiError(404,'Lead not found')
    }

    const { title, dealValue, expectedCloseDate, assignedTo } = req.body

    if (lead.status !== 'QUALIFIED'){
        throw new ApiError(400,'Lead connot be converted to deal')
    }

    if (!title || dealValue === undefined || !expectedCloseDate || !assignedTo){
        throw new ApiError(400,'Fill mandatory fields')
    }

    const existDeal = await Deal.findOne({
        leadId,
        organizationId:req.user.organizationId
    })
    if (existDeal){
        throw new ApiError(409,'A deal already exist for this lead')
    }

    const deal = await Deal.create({
        organizationId:req.user.organizationId,
        leadId:lead._id,
        companyId:lead.companyId,
        createdBy:req.user._id,
        assignedTo,
        title,
        dealValue,
        stage:'QUALIFICATION',
        expectedCloseDate
    })

    await History.create({
        organizationId:req.user.organizationId,
        leadId : lead._id,
        performedBy:req.user._id,
        eventType: 'DEAL_CREATED',
        description: `Deal created by ${req.user._id}`
    })

    return res.status(201)
    .json(new ApiResponse(201,deal,'Deal created successfully'))
})

const getAllDeals = asyncHandler(async(req,res) => {
    const {
        search,
        companyId,
        leadId,
        stage,
        assignedTo,
        createdBy,
        dealValueFrom,
        dealValueTo,
        expectedCloseDateFrom,
        expectedCloseDateto,
        createdFrom,
        createdTo,
        sortBy,
        sortOrder,
        page,
        limit,
    } = req.query

    const query = {
        organizationId:req.user.organizationId
    }

    if (search){
        query.title = { $regex: search, $options: 'i' }
    }

    if (companyId){
        query.companyId = companyId
    }
    if (leadId){
        query.leadId = leadId
    }

    if (stage){
        query.stage = stage
    }

    if (req.user.role === "USER") {
        query.$or = [
            { assignedTo: req.user._id },
            { createdBy: req.user._id }
        ];
    } 
    else if (req.user.role === "ADMIN") {

        if (assignedTo) {
            query.assignedTo = assignedTo;
        }
        if (createdBy) {
            query.createdBy = createdBy;
        }
    } 
    else {
        throw new ApiError(403, "Unauthorized access");
    }

    if (dealValueFrom || dealValueTo) {
        query.dealValue = {}

        if (dealValueFrom) {
            query.dealValue.$gte = Number (dealValueFrom)
        }
        if (dealValueTo) {
            query.dealValue.$lte = Number (dealValueTo)
        }
    }

    if (expectedCloseDateFrom || expectedCloseDateto){
        query.expectedCloseDate = {}

        if (expectedCloseDateFrom){
            query.expectedCloseDate.$gte = new Date (expectedCloseDateFrom)
        }
        if (expectedCloseDateto){
            query.expectedCloseDate.$lte = new Date (expectedCloseDateto)
        }
    }

    if (createdFrom || createdTo){
        query.createdAt = {}

        if (createdFrom){
            query.createdAt.$gte = new Date (createdFrom)
        }
        if (createdTo){
            query.createdAt.$lte = new Date (createdTo)
        }
    }

    const allowedFieldsToSort = [
        "dealValue",
        "expectedCloseDate",
        "stage",
        "createdAt",
        "updatedAt"
    ]

    const sort = {}

    if (sortBy && allowedFieldsToSort.includes(sortBy)){
        sort[sortBy] = sortOrder === 'asc' ? 1: -1
    }
    else{
        sort.createdAt = -1;
    }

    const pageNumber = Number (page) || 1
    const limitNumber = Number (limit) || 10
    const skip = (pageNumber - 1)*limitNumber 
    const totalDeals = await Deal.countDocuments(query);
    const totalPages = Math.ceil(totalLeads/limitNumber );

    const deals = await Deal.find(query)
    .populate('companyId', 'companyName')
    .populate('leadId','firstName lastName email')
    .populate('assignedTo','firstName lastName email')
    .populate('createdBy','firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)

    return res.status(200)
    .json(new ApiResponse(
        200, 
        {
            deals,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalDeals,
                totalPages
            }
        }, 
        'All deals fetched successfully'))

})

const getDeal = asyncHandler(async(req ,res)=>{
    const {id} = req.params
    const deal = await Deal.findOne({
        _id:id,
        organizationId: req.user.organizationId,
    })
    if (!deal) {
        throw new ApiError(404,'Deal not found')
    }

    return res.status(200)
    .json(new ApiResponse(200, deal,'Dead fetched successfully'))
})

const updateDeal = asyncHandler(async (req, res) => {
    const { id } = req.params
    const deal = await Deal.findOne({
        _id: id,
        organizationId: req.user.organizationId,
    })

    if (!deal) {
        throw new ApiError(404, "Deal not found")
    }

    const {
        title,
        dealValue,
        assignedTo,
        stage,
        expectedCloseDate
    } = req.body

    if (title === undefined && dealValue === undefined && assignedTo === undefined && stage === undefined && expectedCloseDate === undefined) {
        throw new ApiError(400, "No fields provided for update")
    }

    if (title !== undefined) {
        deal.title = title
    }

    if (dealValue !== undefined) {
        if (typeof dealValue !== "number" || dealValue < 0) {
            throw new ApiError(400, "Deal value cannot be negative")
        }

        deal.dealValue = dealValue
    }

    if (assignedTo !== undefined) {
        const assignedUser = await User.findOne({
            _id: assignedTo,
            organizationId: req.user.organizationId
        })

        if (!assignedUser) {
            throw new ApiError(404, "Assigned user not found")
        }
        deal.assignedTo = assignedTo
    }

    if (expectedCloseDate !== undefined) {
        deal.expectedCloseDate = expectedCloseDate
    }

    const validStages = [
        "QUALIFICATION",
        "DISCOVERY",
        "PROPOSAL",
        "NEGOTIATION",
        "CLOSED_WON",
        "CLOSED_LOST"
    ]

    const stageTransitions = {
        QUALIFICATION: ["DISCOVERY"],
        DISCOVERY: ["PROPOSAL"],
        PROPOSAL: ["NEGOTIATION"],
        NEGOTIATION: ["CLOSED_WON", "CLOSED_LOST"],
        CLOSED_WON: [],
        CLOSED_LOST: []
    }

    if (stage !== undefined) {
        if (!validStages.includes(stage)) {
            throw new ApiError(400, "Invalid stage");
        }

        if (deal.stage === stage) {
            throw new ApiError(400, "Deal already has this stage");
        }

        if (!stageTransitions[deal.stage].includes(stage)) {
            throw new ApiError(400,`Cannot move deal from ${deal.stage} to ${stage}`)
        }

        deal.stage = stage;
    }
    await deal.save()

    await History.create({
        organizationId: req.user.organizationId,
        leadId: deal.leadId,
        performedBy: req.user._id,
        eventType: "DEAL_UPDATED",
        description: "Deal updated successfully"
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            deal,
            "Deal updated successfully"
        )
    )
})

export {
    createDeal,
    getAllDeals,
    getDeal,
    updateDeal
}