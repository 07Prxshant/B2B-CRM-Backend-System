import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Lead from "../models/lead.model.js";
import User from "../models/user.model.js";
import FollowUp from "../models/followup.model.js";
import History from "../models/history.model.js";

const createFollowUp = asyncHandler(async(req, res)=>{
    const { leadId, assignedTo, followUpDate, note } = req.body;
    if (!leadId || !assignedTo || !followUpDate || !note?.trim()) {
        throw new ApiError(400, 'All fields are mandatory')
    }

    const lead = await Lead.findById(leadId)
    if (!lead){
        throw new ApiError(404,'Lead not found')
    }
    if (lead.organizationId.toString() !== req.user.organizationId.toString()){
        throw new ApiError(400,'Invalid request')
    }
    if (lead.isActive !== true){
        throw new ApiError(400,'Lead is inactive')
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser){
        throw new ApiError(404,'User not found')
    }
    if (assignedUser.organizationId.toString() !== req.user.organizationId.toString()){
        throw new ApiError(400,'Invalid request')
    }
    if (assignedUser.isActive !== true){
        throw new ApiError(400,'Lead is inactive')
    }

    const followUp = await FollowUp.create({
        organizationId: req.user.organizationId,
        leadId,
        assignedTo,
        followUpDate,
        note
    })

    await History.create({
        organizationId:req.user.organizationId,
        leadId : lead._id,
        performedBy: req.user._id,
        eventType: 'FOLLOWUP_CREATED',
        description: `Follow-Up created by ${req.user._id}`
    })

    return res.status(201)
    .json(new ApiResponse(201,followUp,'Follow-up crreated succesfully'))

})

const getAllFollowUps = asyncHandler(async(req, res)=>{
    const followUps = await FollowUp.find({
        organizationId:req.user.organizationId,
    })
    
    return res.status(200)
    .json(new ApiResponse(200,followUps,'All follow-ups fetched successfully'))
})

const getFollowUp = asyncHandler(async(req, res)=>{

})

const updateFollowUp = asyncHandler(async(req, res)=>{

})

export {
    createFollowUp,

}