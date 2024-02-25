import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";

const registerWaitingSchema = new mongoose.Schema({
    phone_num: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["user", "ngo"],
        required: true
    },
    otp:{
        type:Number,
        required:true
    },
    currentStatus:{
        type:Number,
        enum:[0,1,2], // 0=running, 1= ok, 2=not used
        default:0
    }
}, { timestamps: true });

registerWaitingSchema.pre("save",async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.lastLogin = new Date();
        next();
    } else {
        // Update the lastLogin field to current date and time
        this.lastLogin = new Date();
        next();
    }
});


registerWaitingSchema.methods.isPasswordValid = async function (password) {
    try {
        if (!password || !this.password) {
            throw new Error("Password or hash argument is missing.");
        }
        console.log(password)
        console.log(this.password)
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw new Error("An error occurred while validating the password.");
    }
};

// generate access tocken for otp.
registerWaitingSchema.methods.generateAccessTokenOTP = function () {
    return jwt.sign({
        userId: this._id,
        phone_num: this.phone_num
    },
    process.env.ACCESS_TOKEN_SECRET_OTP,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_OTP
    });
};

export const RegisterAuth = mongoose.model("RegisterAuth", registerWaitingSchema);
