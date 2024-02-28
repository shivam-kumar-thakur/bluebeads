import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { SignupDetails } from "../models/idType.models.js";
import { RegisterAuth } from "../models/registerWaiting.model.js";
import { loginAuth } from "../models/loginWaiting.models.js";
import { admin } from "../utils/authConfig.js";
import jwt from "jsonwebtoken";
import twilio from 'twilio';
import dotenv from "dotenv";
dotenv.config();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);



// client.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//      from: '+15017122661',
//      to: '+15558675310'
//    })
//   .then(message => console.log(message.sid));



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await SignupDetails.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh tokens.");
    }
};




const generateOTP= ()=> {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
}

const sendOTP=async (phoneNumber, otp) =>{
    try {
        const message = `Welcome to Bluebeads. Your OTP is: ${otp}`;

        // use twilio for otp
        await client.messages.create({
          body: `Hello user, your Bluebeads OTP for verification is ${otp}. Don't share OTP.`,
          from: process.env.Twilio_Phone,
          to: phoneNumber
        }).then(message => console.log(message.sid))
        .catch((error)=> { throw new ApiError(501,"otp cannot be sent")});

    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}


const OTPAuthRegisterSend=asyncHandler(async (req,res)=>{
    // main purpose to verify the number

    // get the data
    // check for that num in signup. if there then user already exist
    // search for number if exist in register waiting, where status =0, if so put as 2.
    // generate otp for him
    // create a new record in register waiting with data
    // generate accesstocken for him
    // send the tocken and ask for otp

    const { Number, pass, idType } = req.body;

    if (![Number, pass, idType].every((field) => typeof field === 'string' && field.trim())) {
        throw new ApiError(400, "All fields are required.");
    }

    // Regular expression to match the international phone number format
    const phoneNumberRegex = /^\+\d{1,3}\d{6,14}$/;

    if (!phoneNumberRegex.test(Number)) {
        throw new ApiError(400, "Invalid phone number format.");
    }

    const existingUser = await SignupDetails.findOne({ Number });

    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }

    const useinWaiting = await RegisterAuth.findOne({ Number }).where({currentStatus:0});

    if (useinWaiting) {
        // making previous otp request as notUsed=2
        useinWaiting.currentStatus=2;
        await useinWaiting.save();
    }


    // otp generation
    const otp=generateOTP();

    const newUserWaiting = await RegisterAuth.create({
        phone_num:Number,
        password:pass,
        type:idType,
        otp
    });

    if(!newUserWaiting){
        throw new ApiError(501,"something went wrong.")
    }
    try{
        await sendOTP(Number,otp);
    }
    catch(e){
        throw new ApiError(501,"Otp cannot be send.")
    }
    
    const accessTockenAuth=await newUserWaiting.generateAccessTokenOTP();

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessTockenAuth, options)
        .json(new ApiResponse(200, "Enter OTP", { accessTockenAuth }));

})

const OTPAuthRegisterCheck=asyncHandler(async (req,res)=>{

    // get the data of otp and tocken
    // check for that num in signup. if there then user already exist
    // search for number if exist in register waiting, where status =0
    // if present then match otp with stored one, if not respond error.
    // verify with firebase.
    // if both verified, mark register waiting, where status =1
    // create account in signup.
    // generate a access tocken and refresh from signup
    // send the tocken.

    const {otp}=req.body;
    const registerWitingId=req.authUser._id;
    const registerUserNumber=req.authUser.phone_num;

    if(!otp || !otp.trim())
    {
        throw new ApiError(401,"Invalid OTP")
    }

    const existingUser = await SignupDetails.findOne({ registerUserNumber });

    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }

    const userWaitingDetails=await RegisterAuth.findById({registerWitingId});

    if (userWaitingDetails.otp.equals(otp)) {
        // making  otp request as used=1
        userWaitingDetails.currentStatus=1;
        await userWaitingDetails.save();
    }

    const newUser = await SignupDetails.create({
        phone_num,
        password,
        type
    });

    if(!newUser){
        throw new ApiError(501,"Something went wrong")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id);

    const options = { httpOnly: true, secure: true };

    return res.status(200)
    .clearCookie("accessToken", options)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in.", { accessToken, refreshToken })); 

})


const OTPAuthLoginSend=asyncHandler(async (req,res)=>{
    // get the login data
    // search for number if exist, check number verified if not, send the user to signup page, say complete the registeration.
    // if number already verified[ i.e. id exist in signup ] then proceed with password check
    // generate otp
    // search for record in login waiting where it is 0, if there make it to 2
    // generate otp access tocken
    // create a record in loginwaiting
    // send the tocken and ask for otp.

    const { Number, pass } = req.body;

    if (![phone_num, password].every((field) => field && field.trim())) {
        throw new ApiError(400, "Phone number and password are required.");
    }

    // Regular expression to match the international phone number format
    const phoneNumberRegex = /^\+\d{1,3}\d{6,14}$/;
    
    if (!phoneNumberRegex.test(Number)) {
        throw new ApiError(400, "Invalid phone number format.");
    }

    const user = await SignupDetails.findOne({ phone_num });

    if (!user || !(await user.isPasswordValid(password))) {
        throw new ApiError(401, "Invalid phone number or password.");
    }

    const userInWaiting = await loginAuth.findOne({ Number }).where({currentStatus:0});

    if(userInWaiting){
        // making previous otp request as notUsed=2, means make otp unvalid
        userInWaiting.currentStatus=2;
        await userInWaiting.save();
    }

    // otp generation
    const otp=generateOTP();

    const newUserWaiting = await loginAuth.create({
        phone_num:Number,
        password:pass,
        otp
    });

    if(!newUserWaiting){
        throw new ApiError(501,"something went wrong.")
    }

    try{
        await sendOTP(Number,otp);
    }
    catch(e){
        throw new ApiError(501,"Otp cannot be send.")
    }

    const accessTockenAuth=await newUserWaiting.generateAccessTokenOTP();

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessTockenAuth, options)
        .json(new ApiResponse(200, "Enter Login OTP", { accessTockenAuth }));

})

const OTPAuthLoginCheck=asyncHandler(async (req,res)=>{
    // get the data of otp and tocken
    // search for number if exist, check number verified if not, send the user to signup page, say complete the registeration.
    // search for number if exist in register waiting, where status =0
    // if present then match otp with stored one, if not respond error.
    // verify with firebase.
    // if both verified, mark register waiting, where status =1
    // generate a access tocken and refresh from signup
    // send the tocken.

    const {otp}=req.body;
    const loginWitingId=req.authUser._id;
    const loginUserNumber=req.authUser.phone_num;

    if(!otp || !otp.trim())
    {
        throw new ApiError(401,"Invalid OTP")
    }

    const existingUser = await SignupDetails.findOne({ loginUserNumber });

    if (!existingUser) {
        throw new ApiError(409, "User didnt exists.");
    }

    const userWaitingDetails=await loginAuth.findById({loginWitingId});

    if(!userWaitingDetails){
        throw new ApiError(401,"Bad Request")
    }

    if (userWaitingDetails.otp.equals(otp)) {
        // making otp request as used=1
        useinWaiting.currentStatus=1;
        await useinWaiting.save();
    }

    const user = await SignupDetails.findOne({ loginUserNumber });

    if (!user || !(await user.isPasswordValid(password))) {
        throw new ApiError(401, "Invalid phone number or password.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = { httpOnly: true, secure: true };

    return res.status(200)
    .clearCookie("accessToken", options)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in.", { accessToken, refreshToken }));

})



// const registerUser = asyncHandler(async (req, res) => {
//     const { phone_num, password, type } = req.body;
//     // location{lat: , long: }

//     if (![phone_num, password, type].every((field) => field && field.trim())) {
//         throw new ApiError(400, "All fields are required.");
//     }

//     const existingUser = await SignupDetails.findOne({ phone_num });

//     if (existingUser) {
//         throw new ApiError(409, "User already exists.");
//     }

//     const newUser = await SignupDetails.create({
//         phone_num,
//         password,
//         type
//     });

//     return res.status(201).json(new ApiResponse(201, "Registered successfully."));
// });

// const loginUser = asyncHandler(async (req, res) => {
//     const { phone_num, password } = req.body;

//     if (![phone_num, password].every((field) => field && field.trim())) {
//         throw new ApiError(400, "Phone number and password are required.");
//     }

//     const user = await SignupDetails.findOne({ phone_num });

//     if (!user || !(await user.isPasswordValid(password))) {
//         throw new ApiError(401, "Invalid phone number or password.");
//     }

//     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

//     const options = { httpOnly: true, secure: true };

//     return res.status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(new ApiResponse(200, "User logged in.", { accessToken, refreshToken }));
// });

const logoutUser = asyncHandler(async (req, res) => {
    const updatedUser = await SignupDetails.findByIdAndUpdate(
        req.loginUser._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request.");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await SignupDetails.findById(decodedToken._id);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token.");
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = { httpOnly: true, secure: true };

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, "Access token refreshed.", { accessToken, refreshToken: newRefreshToken }));
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token.");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.loginUser._id; // Assuming this is a valid ObjectId

    const user = await SignupDetails.findById(userId);

    if (!user || !(await user.isPasswordValid(oldPassword))) {
        throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully."));
});


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.loginUser, "User fetched successfully."));
});

export {
    OTPAuthRegisterSend,
    OTPAuthRegisterCheck,
    OTPAuthLoginSend,
    OTPAuthLoginCheck,
    // loginUser,
    // registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
};
