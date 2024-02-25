import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserDetails } from "../models/userDetails.model.js";
import { SignupDetails } from "../models/idType.models.js";
import { bloodBank } from "../models/bloodbank.schema.js";
import { CampDetails } from "../models/camps.models.js";
import { Request } from "../models/request.schema.js";
import { fetchLocationDetails } from "../utils/googleMaps.js"; // Import the utility function
import { request } from "express";
import mongoose from "mongoose";

const newRequestSelf=asyncHandler( async (req,res)=>{
    const user = req.loginUser;

    if (user.type !== "user") {
        throw new ApiError(400, "Invalid user type.");
    }

    if (!user.id_details) {
        throw new ApiError(400, "User details are incomplete.");
    }

    const secondaryDetails = await UserDetails.findById(user.id_details).select("-contactList -priorityList -signup");
    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const {location}=req.body;

    const { latitude, longitude } = location;

    // Fetch location details from Google Maps API
    const googleMapsData = await fetchLocationDetails(latitude, longitude);


    const newRequest=await Request.create({
        //secondaryDetails Userid
        raisedBy:secondaryDetails._id,
        raisedType:1,
        bloodGroup:secondaryDetails.bloodGroup,
        location: {
            coordinates:[latitude,longitude],
            state: googleMapsData.state,
            country: googleMapsData.country,
            postalCode: googleMapsData.postalCode
        }
    })

    if (!newRequest){
        throw new ApiError(501, "Something Went Wrong")
    }

    secondaryDetails.requests.push({"requestId":newRequest._id})
    await secondaryDetails.save();

    return res.status(201).json(new ApiResponse(201,"Request created Successfully"))
})


const newRequestOther = asyncHandler(async (req, res) => {
    const loginUser = req.loginUser;

    if (loginUser.type !== "user") {
        throw new ApiError(400, "Invalid user type.");
    }

    if (!loginUser.id_details) {
        throw new ApiError(400, "User details are incomplete.");
    }

    const secondaryDetails = await UserDetails.findOne({ _id: loginUser.id_details }).select("-contactList -priorityList -signup");
    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const { bloodGroup, location } = req.body;

    if (!bloodGroup || !location || !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(bloodGroup)) {
        throw new ApiError(400, "Invalid blood group or location.");
    }

    const { latitude, longitude } = location;

    // Fetch location details from Google Maps API
    const googleMapsData = await fetchLocationDetails(latitude, longitude);

    const newRequest = await Request.create({
        raisedBy: secondaryDetails._id,
        raisedType: 0,
        bloodGroup: bloodGroup,
        location: {
            coordinates:[latitude,longitude],
            state: googleMapsData.state,
            country: googleMapsData.country,
            postalCode: googleMapsData.postalCode
        }
    });

    if (!newRequest) {
        throw new ApiError(501, "Something Went Wrong");
    }

    secondaryDetails.requests.push({"requestId":newRequest._id})
    await secondaryDetails.save();

    return res.status(201).json(new ApiResponse(201, "Request created Successfully"));
});

const requestStatus = asyncHandler(async (req, res) => {
    const loginUser = req.loginUser;

    // Uncomment the code block if userPrimaryDetails is needed
    // const userPrimaryDetails = await SignupDetails.findById(loginUser._id);
    // if (!userPrimaryDetails) {
    //     throw new ApiError(404, "User details not found.");
    // }

    if (loginUser.type !== "user") {
        throw new ApiError(400, "Invalid user type.");
    }

    if (!loginUser.id_details) {
        throw new ApiError(400, "User details are incomplete.");
    }

    const secondaryDetails = await UserDetails.findById(loginUser.id_details).select("-contactList -priorityList -signup");
    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const { requestId } = req.body;

    if(!requestId || requestId==="")
    {
        throw new ApiError(401,"RequestId not valid.")
    }
    
    const isRequestExist = secondaryDetails.requests.some(request => request.requestId.toString() === requestId);

    if (!isRequestExist) {
        throw new ApiError(401, "You don't have any request of this type.");
    }

    const requestDetails = await Request.findById(requestId);

    if (!requestDetails) {
        throw new ApiError(404, "Request details not found.");
    }

    return res.status(200).json(new ApiResponse(200, "Request Details", { requestDetails }));
});

export {newRequestSelf,newRequestOther,requestStatus}