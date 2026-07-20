import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
    organizationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        required:true,
    },
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required:true,
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
    firstName:{
        type: String,
        required:true,
        trim: true
    },
    lastName:{
        type: String,
        trim: true
    },
    email:{
        type:String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone:{
        type: String,
        trim: true
    },
    status:{
        type:String,
        enum:[
            'NEW',
            'CONTACTED',
            'DEMO_SCHEDULED',
            'NEGOTIATION',
            'WON',
            'LOST',
        ],
        default: "NEW"
    },
},{
    timestamps:true
})

export default mongoose.model('Lead',leadSchema)