import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";

const loginWaiting = new mongoose.Schema({
    phone_num: {
        type: String,
        required: true,
        index: true,
        trim: true
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

// generate access tocken for otp.
loginWaiting.methods.generateAccessTokenOTP = function () {
    return jwt.sign({
        userId: this._id,
        phone_num: this.phone_num
    }, 
    process.env.ACCESS_TOKEN_SECRET_OTP,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_OTP
    });
};

export const loginAuth = mongoose.model("loginAuth", loginWaiting);
