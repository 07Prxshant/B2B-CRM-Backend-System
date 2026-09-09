import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDashboard = asyncHandler(async(req,res) => {
    const leadStat = await Lead.aggregate([
        {
            $match:{
                organizationId:req.user.organizationId
            }
        },
        {
            $facet:{
                total:[
                    { $count: "count" }
                ],
                new:[
                    { $match: { status:"NEW" } },
                    { $count: "count" }
                ],
                contacted:[
                    { $match: { status:"CONTACTED" } },
                    { $count: "count" }
                ],
                qualified:[
                    { $match: { status:"QUALIFIED" } },
                    { $count: "count" }
                ],
                unqualified:[
                    { $match: { status:"UNQUALIFIED" } },
                    { $count: "count" }
                ],
            }
        }
    ])

    const dealStat = await Deal.aggregate([
        {
            $match:{
                organizationId:req.user.organizationId
            }
        },
        {
            $facet:{
                total:[
                    { $count:'count' }
                ],
                pipelineValue:[
                    { 
                        $group:{
                            _id: null,
                            value: {
                                $sum: "$dealValue"
                            }
                        }
                    }
                ],
                closedWon:[
                    { $match: { stage:"CLOSED_WON" } },
                    {
                        $group:{
                            _id: null,
                            count: {
                                $sum:1
                            },
                            value: {
                                $sum: "$dealValue"
                            }
                        }
                    }
                ],
                closedLost:[
                    { $match: { stage:"CLOSED_LOST" } },
                    {
                        $group:{
                            _id: null,
                            count: {
                                $sum:1
                            },
                            value: {
                                $sum: "$dealValue"
                            }
                        }
                    }
                ],
            }
        }
    ])

    const followUpStat = await FollowUp.aggregate([
        {
            $match: {
                organizationId: req.user.organizationId
            }
        },

        {
            $facet: {
                total:[
                    { $count:'count' }
                ],
                pending: [
                    { $match: { status: "PENDING" } },
                    { $count: "count" }
                ],

                completed: [
                    { $match: { status: "COMPLETED" } },
                    { $count: "count" }
                ],

                cancelled: [
                    { $match: { status: "CANCELLED" } },
                    { $count: "count" }
                ]
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(
        200,
        {
            leads: {
                total: leadStat[0].total[0]?.count || 0,
                new: leadStat[0].new[0]?.count || 0,
                contacted: leadStat[0].contacted[0]?.count || 0,
                qualified: leadStat[0].qualified[0]?.count || 0,
                unqualified: leadStat[0].unqualified[0]?.count || 0
            },

            deals: {
                total: dealStat[0].total[0]?.count || 0,

                pipelineValue:
                    dealStat[0].pipelineValue[0]?.value || 0,

                closedWon: {
                    count: dealStat[0].closedWon[0]?.count || 0,
                    value: dealStat[0].closedWon[0]?.value || 0
                },

                closedLost: {
                    count: dealStat[0].closedLost[0]?.count || 0,
                    value: dealStat[0].closedLost[0]?.value || 0
                }
            },

            followUps: {
                total: followUpStat[0].total[0]?.count || 0,
                pending: followUpStat[0].pending[0]?.count || 0,
                completed: followUpStat[0].completed[0]?.count || 0,
                cancelled: followUpStat[0].cancelled[0]?.count || 0
            }
        },
        "Dashboard fetched successfully"
    ))
})

export {

}