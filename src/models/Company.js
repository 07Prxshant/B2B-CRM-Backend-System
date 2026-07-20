import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

export default mongoose.model("Company", companySchema);