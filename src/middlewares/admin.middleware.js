import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const verifyAdmin = asyncHandler(async(req, res, next)=>{
    const user = req.user
    if (!user){
        throw new ApiError(401,'User not authenticated')
    }

    if (user.role !== 'ADMIN'){
        throw new ApiError(403,'Unauthorized request')
    }
    
    next()
})

