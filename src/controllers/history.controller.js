import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import History from "../models/history.model.js";
import Lead from "../models/lead.model.js";
import User from "../models/user.model.js"


const leadHistory = asyncHandler(async(req, res) => {
    const { id } = req.params 
    const lead = await Lead.findOne({
        _id:id,
        organizationId:req.user.organizationId,
    })
    if (!lead) {
        throw new ApiError(404,'Lead not found')
    }

    const history = await History.find({
        organizationId:req.user.organizationId,
        leadId:lead._id,
    }).sort({createdAt:-1})

    return res.status(200)
    .json(new ApiResponse(200,history,'Lead history fetched successfully'))
})

export { leadHistory }