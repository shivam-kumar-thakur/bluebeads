import asyncHandler from "../utils/asynchandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { CampDetails } from "../models/camps.models.js";
import { UserDetails } from "../models/userDetails.model.js";
import { SignupDetails } from "../models/idType.models.js";
import { NgoDetails } from "../models/ngo.models.js";
import { fetchLocationDetails } from "../utils/googleMaps.js"; // Import the utility function

const campCreation = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can create camps.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { camp_name, location, description, start_date, start_time_hour,end_date,end_time_hour } = req.body;

    if(![ camp_name, description, start_date, start_time_hour,end_date,end_time_hour].every((feild)=> feild && feild.trim()!==""))
    {
        throw new ApiError(400, "All details are required.");
    }
    if (!location || typeof location !== 'object' || Object.keys(location).length === 0 || !location.latitude || !location.longitude || typeof location.latitude !== 'string' || typeof location.longitude !== 'string' || location.latitude.trim() === '' || location.longitude.trim() === '') {
        throw new ApiError(400, "Location details are required.");
    }

    const {latitude,longitude}=location;
    // Fetch location details from Google Maps API
    const googleMapsData = await fetchLocationDetails(latitude, longitude);
    const newCamp = await CampDetails.create({
        campName: camp_name,
        location: {coordinates:[latitude,longitude],
            state: googleMapsData.state,
            country: googleMapsData.country,
            postalCode: googleMapsData.postalCode
        },
        campDescription: description,
        ngo: userSecondaryDetails._id,
        donationStartDate:start_date,
        donationStartTime:start_time_hour,
        donationEndDate:end_date,
        donationsEndTime:end_time_hour
    });

    if (!newCamp) {
        throw new ApiError(500, "Internal Server Error: Something went wrong.");
    }

    userSecondaryDetails.camps.push(newCamp._id);
    await userSecondaryDetails.save();

    return res.status(201).json(new ApiResponse(201, "Created: Successfully created camp", { campId: newCamp._id }));
});

const campDetailsAdmin = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId } = req.body;

    if(!campId || !campId.trim()){
        throw new ApiError(401,"Camp Id invalid")
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const overallData = {
        totalcamp: userSecondaryDetails.camps.length,
        totalVoulntersRegister: 0,
        totalDonorsRegister: 0,
        totalPersonsDonated: 0,
        bloodGroups: {
            "A+": { total: 0, donated: 0 },
            "A-": { total: 0, donated: 0 },
            "B+": { total: 0, donated: 0 },
            "B-": { total: 0, donated: 0 },
            "AB+": { total: 0, donated: 0 },
            "AB-": { total: 0, donated: 0 },
            "O+": { total: 0, donated: 0 },
            "O-": { total: 0, donated: 0 }
        }
    };
    
    for (const campId of userSecondaryDetails.camps) {
        const pipeline = [
            { $match: { _id:new mongoose.Types.ObjectId(campId) } }, // Match the camp by its ID
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    noOfVolunteers: { $size: "$volunteersRegister" }, // Count the number of volunteers
                    noOfDonorsRegister: { $size: "$donorsRegister" }, // Count the number of donors registered
                    donationsInfo: {
                        $map: {
                            input: "$donorsRegister",
                            as: "donor",
                            in: {
                                bloodType: "$$donor.bloodType",
                                status: "$$donor.status"
                            }
                        }
                    }
                }
            }
        ];
    
        const campData = await CampDetails.aggregate(pipeline);
    
        // Aggregate statistics for each camp
        overallData.totalVoulntersRegister += campData[0]?.noOfVolunteers || 0;
        overallData.totalDonorsRegister += campData[0]?.noOfDonorsRegister || 0;
        overallData.totalPersonsDonated += campData[0]?.donationsInfo.filter(d => d.status === 1).length || 0;
    
        // Count blood groups for each camp
        campData[0]?.donationsInfo.forEach(donation => {
            if (donation.status === 1) {
                overallData.bloodGroups[donation.bloodType].donated++;
            }
            overallData.bloodGroups[donation.bloodType].total++;
        });
    }

    const campInfo = await CampDetails.findById(campId).select("-location");
    // Respond with camp details and aggregated statistics
    return res.status(200).json({
        success: true,
        message: "Success: Camp details retrieved successfully.",
        campDetails: campInfo,
        overallData: overallData
    });
});



const campAdminRegister = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "Camp Id invalid")
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId).select("donorsRegister");

    if (!campInfo) {
        throw new ApiError(401, "No camp Exist.")
    }

    const registeredUsers = [];

    for (const elements of campInfo.donorsRegister) {
        const userInfo = await UserDetails.findById(elements.donor).select("userName bloodGroup gender dob signup");

        if (userInfo) {
            const signupDetails = await SignupDetails.findById(userInfo.signup);

            if (!signupDetails) {
                throw new ApiError(501, "Signup details not found.");
            }

            registeredUsers.push({
                userId:elements.donor,
                userName: userInfo.userName,
                bloodGroup: userInfo.bloodGroup,
                gender: userInfo.gender,
                dob: userInfo.dob,
                Number:signupDetails.phone_num
            });
        }
    }

    return res.status(201).json(new ApiResponse(201, "Registered users are:", { users: registeredUsers }))
})


const campAdminDonated=asyncHandler(async (req,res)=>{
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "Camp Id invalid")
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId).select("donorsRegister");

    if (!campInfo) {
        throw new ApiError(401, "No Donations yet, or camp not Exist.");
    }

    const donatedUsers = [];

    for (const donors of campInfo.donorsRegister) {
        if(!donors.status===1){
            continue
        }
        const userInfo = await UserDetails.findById(donors.donor).select("userName bloodGroup gender dob signup");

        if (userInfo) {
            const signupDetails = await SignupDetails.findById(userInfo.signup);

            if (!signupDetails) {
                throw new ApiError(501, "Signup details not found.");
            }

            donatedUsers.push({
                userId: donors.donor,
                userName: userInfo.userName,
                bloodGroup: userInfo.bloodGroup,
                gender: userInfo.gender,
                dob: userInfo.dob,
                Number: signupDetails.phone_num
            });
        }
    }

    return res.status(201).json(new ApiResponse(201, "Registered users are:", { users: donatedUsers }));
})


const campAdminVolunter=asyncHandler(async (req,res)=>{
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "Camp Id invalid")
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId)
    .where('volunteersRegister.approvalStatus').equals(1)
    .select("volunteersRegister");

    if (!campInfo) {
        throw new ApiError(401, "No volunters yet, or camp not Exist.");
    }

    const ApprovedVoluntersDetails = [];

    for (const user_id of campInfo.volunteersRegister) {
        const userInfo = await UserDetails.findById(user_id).select("userName bloodGroup gender dob signup");

        if (userInfo) {
            const signupDetails = await SignupDetails.findById(userInfo.signup);

            if (!signupDetails) {
                throw new ApiError(501, "Signup details not found.");
            }

            ApprovedVoluntersDetails.push({
                userId: donorId,
                userName: userInfo.userName,
                bloodGroup: userInfo.bloodGroup,
                gender: userInfo.gender,
                dob: userInfo.dob,
                signup: userInfo.signup
            });
        }
    }

    return res.status(201).json(new ApiResponse(201, "Registered users are:", { volunters: ApprovedVoluntersDetails }));

})

const campAdminMarkDonor = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId, userId } = req.body;

    if (![campId, userId].every(field => field && field.trim())) {
        throw new ApiError(401, "Details invalid");
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId);

    const check=campInfo.donorsRegister.find(element=> element.donor.toString()===userId)

    if (!check) {
        throw new ApiError(401, "No user of this Id.");
    }

    const userDonated = await UserDetails.findById(userId).select("donations");

    if (!userDonated) {
        throw new ApiError(401, "User invalid");
    }

    userDonated.donations.forEach(donation => {
        if (donation.campId.equals(campId)) {
            donation.requestStatus = 1;
        }
    });

    campInfo.donorsRegister.forEach((element)=>{
        if(element.donor.equals(userId)){
            element.status=1
        }
    })

    await campInfo.save();
    await userDonated.save();

    res.status(200).json({ message: "Donor marked successfully." });
});


const campAdminUnmarkDonor = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const { campId, userId } = req.body;

    if (![campId, userId].every(field => field && field.trim())) {
        throw new ApiError(401, "Details invalid");
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId);

    const check= campInfo.donorsRegister.find(element=> element.donor.toString()===userId);

    if (!check) {
        throw new ApiError(401, "No user of this Id.");
    }

    const userDonated = await UserDetails.findById(userId).select("donations");

    if (!userDonated) {
        throw new ApiError(401, "User invalid");
    }

    userDonated.donations.forEach(donation => {
        if (donation.campId.equals(campId)) {
            donation.requestStatus = 0;
        }
    });

    campInfo.donorsRegister.forEach((element)=>{
        if(element.donor.equals(userId)){
            element.status=0;
        }
    })

    await campInfo.save();
    await userDonated.save();

    res.status(200).json({ message: "Donor Unmarked successfully." });
});

const campAdminVolunterRequests = asyncHandler(async (req, res) => {
    const userId = req.loginUser._id;

    const user = await SignupDetails.findById(userId);

    if (user.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!user.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const ngoDetails = await NgoDetails.findById(user.id_details);

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "Camp Id invalid");
    }

    if (!ngoDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campDetails = await CampDetails.findById(campId)
        .select("volunteersRegister");

    if (!campDetails) {
        throw new ApiError(404, "Camp not found.");
    }

    const NotApprovedVolunteers = [];

    for (const volunteer of campDetails.volunteersRegister) {
        if (volunteer.approvalStatus === 0) {
            const userDetails = await UserDetails.findById(volunteer.user_id)
                .select("userName bloodGroup gender dob signup");

            if (!userDetails) {
                throw new ApiError(404, "User details not found.");
            }

            NotApprovedVolunteers.push({
                userId: volunteer.user_id,
                userName: userDetails.userName,
                bloodGroup: userDetails.bloodGroup,
                gender: userDetails.gender,
                dob: userDetails.dob,
                signup: userDetails.signup
            });
        }
    }

    return res.status(200).json({
        success: true,
        message: "Volunteers waiting for approval:",
        volunteers: NotApprovedVolunteers
    });
});

const campAdminApproveVolunter = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const {campId, userId } = req.body;

    if (![campId, userId].every(field => field && field.trim()!=="")) {
        throw new ApiError(401, "Details invalid");
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId);

    if (!campInfo) {
        throw new ApiError(404, "Camp details not found.");
    }

    const check = campInfo.volunteersRegister.find(volunteer => volunteer.user_id.toString() === userId);

    if (!check) {
        throw new ApiError(401, "No user of this Id.");
    }

    const userVolunteer = await UserDetails.findById(userId).select("volunteerExperience");

    if (!userVolunteer) {
        throw new ApiError(401, "User invalid");
    }

    check.approvalStatus = 1;

    userVolunteer.volunteerExperience.forEach(volunteer => {
        if (volunteer.campId.equals(campId)) {
            volunteer.requestStatus = 1;
        }
    });

    campInfo.volunteersRegister.forEach(volunteer=>{
        if(volunteer.user_id.equals(userId)){
            volunteer.approvalStatus=1;
        }
    })


    await campInfo.save();
    await userVolunteer.save();

    res.status(200).json({ message: "Volunteer Approved successfully." });
});

const campAdminDeclineVolunter = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(403, "Forbidden: Only NGOs can view camp details.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Bad Request: Complete the details first for the NGO.");
    }

    const userSecondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details);

    const {campId, userId } = req.body;

    if (![campId, userId].every(field => field && field.trim())) {
        throw new ApiError(401, "Details invalid");
    }

    if (!userSecondaryDetails.camps.includes(campId)) {
        throw new ApiError(404, "Not Found: Camp does not belong to you.");
    }

    const campInfo = await CampDetails.findById(campId);

    const check=campInfo.volunteersRegister.find(volunteer =>volunteer.user_id.toString()===userId )

    // const check = campInfo.volunteersRegister.find(volunteer => volunteer.user_id.toString() === userId);

    // if (!check) {
    //     throw new ApiError(401, "No user of this Id.");
    // }

    if (!check) {
        throw new ApiError(401, "No user of this Id.");
    }

    const userVolunteer = await UserDetails.findById(userId).select("volunteerExperience");

    if (!userVolunteer) {
        throw new ApiError(401, "User invalid");
    }
    userVolunteer.volunteerExperience.forEach(volunteer => {
        if (volunteer.campId.equals(campId)) {
            volunteer.requestStatus = 2;
        }
    });

    campInfo.volunteersRegister.forEach(volunteer=>{
        if(volunteer.user_id.equals(userId)){
            volunteer.approvalStatus=2;
        }
    })

    await campInfo.save();
    await userVolunteer.save();

    res.status(200).json({ message: "Volunteer decline successfully." });
});

export {campCreation,
    campDetailsAdmin,
    campAdminRegister,
    campAdminDonated,
    campAdminVolunter,
    campAdminMarkDonor,
    campAdminUnmarkDonor,
    campAdminVolunterRequests,
    campAdminApproveVolunter,
    campAdminDeclineVolunter}

// const addVolunteer = asyncHandler(async (req, res) => {
//     const userTypeId = req.loginUser._id;
//     const { campId } = req.params;

//     const userPrimaryDetails = await SignupDetails.findById(userTypeId);

//     if (userPrimaryDetails.type !== "user") {
//         throw new ApiError(403, "Forbidden: Only users can register as volunteers.");
//     }

//     if (!userPrimaryDetails.id_details) {
//         throw new ApiError(400, "Bad Request: Fill user details first.");
//     }

//     const secondaryDetails = await UserDetails.findById(userPrimaryDetails.id_details).select("-contactList -priorityList -signup");

//     if (!secondaryDetails) {
//         throw new ApiError(500, "Internal Server Error: Something went wrong in details fetching.");
//     }

//     const camp = await CampDetails.findById(campId);

//     if (!camp) {
//         throw new ApiError(404, "Not Found: Camp not found.");
//     }

//     camp.volunteersRegister.push(secondaryDetails._id)
//     secondaryDetails.volunteerExperience.push(camp._id)

//     await secondaryDetails.save();
//     await camp.save();

//     return res.status(200).json(new ApiResponse(200, "Success: Registered for volunteer."));
// });

// export { campCreation, campDetailsAdmin, addVolunteer };
