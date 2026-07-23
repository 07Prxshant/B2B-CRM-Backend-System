import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

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

userSchema.pre('save', async function (){
    if (!this.isModified('password')) return
    
    this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            organizationId: this.organizationId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jsonwebtoken.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export default mongoose.model("User", userSchema);