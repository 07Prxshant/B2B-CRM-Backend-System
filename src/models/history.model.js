import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    organizationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    leadId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true
    },
    performedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    eventType: {
        type: String,
        enum: [
            "LEAD_CREATED",
            "STATUS_CHANGED",
            "LEAD_ASSIGNED",
            "FOLLOWUP_CREATED",
            "FOLLOWUP_UPDATED",
            "NOTE_ADDED",
            "LEAD_UPDATED"
        ],
        default: "LEAD_CREATED"
    },

    description: {
        type: String,
        required: true,
        trim: true
    }


},{
    timestamps:true
})

export default mongoose.model('History', historySchema)