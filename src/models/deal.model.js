import mongoose from "mongoose"

const dealSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },

    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    dealValue: {
        type: Number,
        required: true,
        min: 0
    },

    stage: {
        type: String,
        enum: [
            "QUALIFICATION",
            "DISCOVERY",
            "PROPOSAL",
            "NEGOTIATION",
            "CLOSED_WON",
            "CLOSED_LOST"
        ],
        default: "QUALIFICATION"
    },

    expectedCloseDate: {
        type: Date
    }
},{
    timestamps:true
})

export default mongoose.model('Deal',dealSchema)