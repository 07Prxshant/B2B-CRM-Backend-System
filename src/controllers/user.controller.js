import { asyncHandler } from "../utils/asyncHandler.js";

const requestHandler = asyncHandler(async (req, rest) => {
    rest.status(200).json({
        message: 'registered in crm'
    })
})

export {requestHandler}