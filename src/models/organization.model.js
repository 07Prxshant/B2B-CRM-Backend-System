import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true,
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true,
    },
    industry:{
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }

},{
    timestamps:true
})

export default mongoose.model('Organization', organizationSchema)