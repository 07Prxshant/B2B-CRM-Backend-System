import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const createUser = asyncHandler(async(req,res)=>{
    const {firstName,lastName, email, password, role} = req.body
    if (
        [firstName,lastName, email, password, role]
        .some(field => !field || field.trim() === "")
    ) { 
        throw new ApiError(400,'All fields are mandatory')
    }

    const exisitingUser = await User.findOne({email})
    if (exisitingUser){
        throw new ApiError(409,'User with this email already exist')
    }

    if (!['ADMIN', 'USER'].includes(role)){
        throw new ApiError(400,'Invalid role')
    }
    
    const user = await User.create({
        organizationId: req.user.organizationId,
        firstName,
        lastName, 
        email, 
        password,
        role
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    return res.status(201)
    .json(new ApiResponse(201,createdUser,'User created successfully'))
})

const getAllUsers = asyncHandler(async(req, res)=>{
    const users = await User.find({
        organizationId: req.user.organizationId
    }).select('-password -refreshToken')

return res.status(200)
.json(new ApiResponse(200, users, 'All the users fetched successfully'))
})


export {
    createUser,
    getAllUsers,

}