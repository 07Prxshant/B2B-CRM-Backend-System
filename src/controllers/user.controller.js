import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating auth tokens')
    }
}

const registerAdmin = asyncHandler(async (req, res) => {
    const {organizationName, organizationEmail, industry, firstName, lastName, email, password} = req.body

    if (
        [organizationName, organizationEmail, industry, firstName, lastName, email, password].some((field) => !field || field?.trim() === '')
    ){
        throw new ApiError(400, 'All fields are mandatory')
    }

    const existingOrganisation = await Organization.findOne({email : organizationEmail})
    if (existingOrganisation){
        throw new ApiError(409, 'Organisation already exists')
    }

    const existingAdminUser = await User.findOne({email})
    if (existingAdminUser){
        throw new ApiError(409, `Admin with email ${email} already exists`)
    }

    const organisation = await Organization.create({
        email: organizationEmail,
        name: organizationName,
        industry
    })
    const adminUser = await User.create({
        organizationId: organisation._id,
        email,
        firstName,
        lastName,
        password,
        role: 'ADMIN'
    })

    if (!organisation){
        throw new ApiError(500, 'Failed to create organisaton')
    }
    if (!adminUser){
        throw new ApiError(500, 'Failed to create adminUser')
    }

    const createdOrganisation = await Organization.findById(organisation._id).select('-isActive')
    const createdAdminUser = await User.findById(adminUser._id).select('-password -isActive')

    return res.status(201).json(
        new ApiResponse(201, [createdOrganisation,createdAdminUser], 'Organisation and admin registered')
    )
})

const loginUser = asyncHandler(async(req, res) => {

    const {email, password} = req.body
    if(!email || !password){
        throw new ApiError (400,'Email and password are required')
    }

    const user = await User.findOne({email})
    if (!user){
        throw new ApiError (401,'Invalid email or password')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        throw new ApiError (401, 'Invalid email or password')
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id) 
    
    const loggedInUser = await User.findById(user._id).select('-password -isActive')

    const options  = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse (200,{
            user: loggedInUser
        },'Logged in successfully')
    )
})

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly:true,
        secure: true
    }

    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new ApiResponse(200,{},'Logged out successfully')
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingToken){
        throw new ApiError(401, 'Unauthorized token')
    }

    try {
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select('-password -isActive')
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if (incomingToken !== user.refreshToken){
            throw new ApiError(401, 'Unauthorized token')
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(decodedToken?._id)
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    accessToken,
                    refreshToken
                },
                'Access token refreshed'
            )
        )
    } catch (error) {
        throw new ApiError(401,'Invalid or expired refresh token')
    }
})

export { 
    registerAdmin,
    loginUser,
    logoutUser,
    refreshAccessToken
}