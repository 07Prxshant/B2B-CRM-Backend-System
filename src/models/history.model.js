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
             "LEAD_UPDATED",
            "LEAD_ASSIGNED",
            "LEAD_DELETED",
            "STATUS_CHANGED",
            "FOLLOWUP_CREATED",
            "FOLLOWUP_UPDATED",
            "NOTE_CREATED",
            "NOTE_UPDATED",
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