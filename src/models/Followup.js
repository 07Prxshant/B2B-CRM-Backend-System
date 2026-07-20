import mongoose from 'mongoose'

const followupSchema = new mongoose.Schema({
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
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followUpDate:{
        type: Date,
        required:true
    },
    note:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:[
            'PENDING',
            'COMPLETED',
            'CANCELLED'
        ],
        default:'PENDING'
    }
},{
    timestamps:true
})

export default mongoose.model('Followup',followupSchema)