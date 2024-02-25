import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";

const signupSchema = new mongoose.Schema({
    phone_num: {
        type: String,
        required: true,
        index: true,
        unique: true,
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
    id_details:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Details",
        default:null
    },
    lastLogin: {
        type: Date,
        required: true,
        default: Date.now
    },
    // no need if number verified then only user exist.
    // numberVerification:{
    //     type:Boolean,
    //     default:false,
    //     required:true
    // },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

signupSchema.pre("save",async function(next) {
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


signupSchema.methods.isPasswordValid = async function (password) {
    try {
        console.log(password)
        console.log(this.password)
        if (!password || !this.password) {
            throw new Error("Password or hash argument is missing.");
        }
        const isMatch = await bcrypt.compare(password, this.password);
        console.log(isMatch)
        return isMatch;
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw new Error("An error occurred while validating the password.");
    }
};

// generate access tocken for otp.
signupSchema.methods.generateAccessTokenOTP = function () {
    return jwt.sign({
        userId: this._id,
        phone_num: this.phone_num
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};


signupSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        userId: this._id,
        phone_num: this.phone_num
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

signupSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const SignupDetails = mongoose.model("SignupDetails", signupSchema);
