import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js";
import Company from "../models/company.model.js"

const createCompany = asyncHandler(async(req, res)=>{
    const {name, email, industry} = req.body
    const companyName = name?.trim()
    if (!companyName){
        throw new ApiError(400, 'Company name is mandatory')
    }

    const existingCompany = await Company.findOne({
        name: companyName,
        organizationId: req.user.organizationId
    })
    if (existingCompany){
        throw new ApiError(409,'Company already exists')
    }

    const company = await Company.create({
        organizationId: req.user.organizationId,
        name: companyName,
        email,
        industry
    })

    return res.status(201)
    .json(new ApiResponse(201, company, 'Company created successfully'))
})

const getAllCompany = asyncHandler(async(req, res)=>{
    const companies = await Company.find({
        organizationId: req.user.organizationId,
        isActive: true
    })

    return res.status(200)
    .json(new ApiResponse(200, companies, 'All companies fetched successfully'))
})

const getCompany = asyncHandler(async(req, res)=>{
    const {id} = req.params

    const company = await Company.findOne({
        _id: id,
        organizationId: req.user.organizationId,
    })
    if (!company){
        throw new ApiError(404, 'Company not found')
    }

    return res.status(200)
    .json(new ApiResponse(200, company, 'Company fetched successfully'))
})

const updateCompany = asyncHandler(async(req, res)=>{
    const {id} = req.params
    const {name, email, industry} = req.body
    const companyName = name?.trim()
    if (!companyName && !email && !industry){
        throw new ApiError(400, 'At least one field is required')
    }

    const company = await Company.findOne({
        _id:id,
        organizationId:req.user.organizationId
    })
    if (!company){
        throw new ApiError(404,'Company not found')
    }

    if (companyName) {
        const existingCompany = await Company.findOne({
            name: companyName,
            organizationId: req.user.organizationId
        });

        if (existingCompany && existingCompany._id.toString() !== company._id.toString()) {
            throw new ApiError(409, "Company already exists");
        }

        company.name = companyName;
    }

    if(email){
        company.email = email
    }

    if(industry){
        company.industry = industry
    }

    await company.save()

    const updatedCompany = await Company.findOne({
        _id: id,
        organizationId: req.user.organizationId
    })

    return res.status(200)
    .json(new ApiResponse(200, updatedCompany, 'Company details updated successfully'))
})

export {
    createCompany,

}