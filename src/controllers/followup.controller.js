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
    const { id } = req.params
    const followUp = await FollowUp.findOne({
        _id:id,
        organizationId:req.user.organizationId
    })

    if (!followUp) {
        throw new ApiError(404, 'Follow-up not found')
    }

    return res.status(200)
    .json(new ApiResponse(200,followUp,'Follow-up fetched successfully'))
})

const updateFollowUp = asyncHandler(async(req, res)=>{
    const { id } = req.params
    const { followUpDate, assignedTo, note, status} = req.body;
    if ( followUpDate === undefined && assignedTo === undefined && note === undefined && status === undefined){
        throw new ApiError(400,"Atleast one fields is required")
    }

    const followUp = await FollowUp.findOne({
        _id:id,
        organizationId:req.user.organizationId
    })

    if (!followUp){
        throw new ApiError(404,"follow-up not found")
    }

    const oldFollowUpDate = followUp.followUpDate 
    if (followUpDate !== undefined) {
        if (oldFollowUpDate.toString() === followUpDate.toString()) {
            throw new ApiError(400, "Follow-up already has this date")
        }
        followUp.followUpDate = followUpDate
    }

    if (assignedTo !== undefined) {
        const user = await User.findOne({
            _id: assignedTo,
            organizationId: req.user.organizationId,
            isActive: true
        })

        if (!user) {
            throw new ApiError(404, "Assigned user not found")
        }

        if (followUp.assignedTo.toString() === assignedTo) {
            throw new ApiError(400, "Follow-up is already assigned to this user")
        }

        followUp.assignedTo = assignedTo
    }

    if (note !== undefined) {
        if (!note.trim()) {
            throw new ApiError(400, "Note cannot be empty")
        }

        followUp.note = note.trim()
    }

    const oldStatus = followUp.status
    if (status !== undefined) {
        const validStatus = [
            'PENDING',
            'COMPLETED',
            'CANCELLED'
        ]

        if (!validStatus.includes(status)) {
            throw new ApiError(400, "Invalid follow-up status")
        }

        if (oldStatus === status) {
            throw new ApiError(400, "Follow-up already has this status")
        }

        followUp.status = status
    }

    await followUp.save()

    await History.create({
        organizationId:req.user.organizationId,
        leadId : followUp.leadId,
        performedBy: req.user._id,
        eventType: 'FOLLOWUP_UPDATED',
        description: `Follow-Up updated by ${req.user._id}`
    })

    return res.status(200)
    .json(new ApiResponse(200,followUp,"Follow-up updated successfully"))
})

export {
    createFollowUp,

}