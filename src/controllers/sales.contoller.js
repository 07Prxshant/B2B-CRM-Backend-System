import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Deal from "../models/deal.model.js"

const salesPipeline = asyncHandler(async(req,res) => {
    const pipeline = await Deal.aggregate([
        {
            $match:{
                organizationId:req.user.organizationId
            }
        },
        {
             $group: {
                _id: "$stage",

                dealCount: {
                    $sum: 1
                },

                totalValue: {
                    $sum: "$dealValue"
                }
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(
        200,
        pipeline,
        "Sales stat fetched successfully"
    ))
})

export {
    salesPipeline
}