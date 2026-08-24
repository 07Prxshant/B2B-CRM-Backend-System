import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Note from "../models/note.model.js"
import Lead from "../models/lead.model.js"
import History from "../models/history.model.js"
import User from "../models/user.model.js"
import { tr } from "framer-motion/client"

const createNote = asyncHandler(async(req, res)=>{
    const {content} = req.body
    if (!content || !content.trim()) {
        throw new ApiError(400,'Content is required')
    }

    const lead = await Lead.findOne({
        organizationId:req.user.organizationId,
        _id:req.params.leadId,
        isActive:true
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    const note =  await Note.create({
        organizationId:req.user.organizationId,
        leadId:req.params.leadId,
        createdBy:req.user._id,
        content:content.trim()
    })

    await History.create({
        organizationId:req.user.organizationId,
        leadId:req.params.leadId,
        performedBy:req.user._id,
        eventType:'NOTE_CREATED',
        description:`Note added to lead`
    })

    return res.status(201)
    .json(new ApiResponse(201,note,'Note created successfully'))
})

const getAllNotes = asyncHandler(async(req, res)=>{
    const { leadId } = req.params

    const lead = await Lead.findOne({
        organizationId:req.user.organizationId,
        _id:leadId,
        isActive:true
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    const notes = await Note.find({
        leadId:lead._id,
        organizationId:req.user.organizationId,
    }).sort({createdAt:-1})
    
    return res.status(200)
    .json(new ApiResponse(200,notes,'Notes fetched successfully'))
})

const getNote = asyncHandler(async(req, res) => {
    const { id } = req.params
    const note =  await Note.findOne({
        _id:id,
        organizationId:req.user.organizationId
    })
    if (!note) {
        throw new ApiError(404,'Note not found')
    }

    return res.status(200)
    .json(new ApiResponse(200,note,'Note fetched successfully'))
})

const updateNote =  asyncHandler(async(req,res) => {
    const { id } = req.params
    const { content } = req.body
    if (!content || ! content.trim()) {
        throw new ApiError(400,'Content is required')
    }

    const note =  await Note.findOneAndUpdate(
        {
            _id:id,
            organizationId:req.user.organizationId,
        }, 
        {
            content:content.trim()
        }, 
        { 
            new:true, 
            runValidators:true 
        }
    )
    if (!note) {
        throw new ApiError(404,'Note not found')
    }

    await History.create({
        organizationId:req.user.organizationId,
        leadId:note.leadId,
        performedBy:req.user._id,
        eventType:'NOTE_UPDATED',
        description:`Note updated`
    })

    return res.status(200)
    .json(new ApiResponse(200,note,'Note updated successfully'))
})

const deleteNote = asyncHandler(async(req, res) => {
    const { id } = req.params
    const note = await Note.findOneAndUpdate(
        {
            _id:id,
            organizationId:req.user.organizationId
        },
        {
            content:""
        },
        {
            new:true,
            runValidators:false
        }
    )
    if (!note) {
        throw new ApiError(404,'Note not found')
    }

    await History.create({
        organizationId:req.user.organizationId,
        leadId:note.leadId,
        performedBy:req.user._id,
        eventType:'NOTE_DELETED',
        description:`Note deleted`
    })

    return res.status(200)
    .json(new ApiResponse(200,{},'Note deleted successfully'))

})

export {
    createNote,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote
}