import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
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
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content:{
        type: String,
        required: true,
        trim: true
    }
},{
    timestamps:true
})

export default mongoose.model('Note',noteSchema)