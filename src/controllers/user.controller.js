import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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

export { registerAdmin }