import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Organization',
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
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['ADMIN','USER'],
        default:'USER'
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps: true
})

export default mongoose.model("User", userSchema);