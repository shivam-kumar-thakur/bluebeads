// Import required modules
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserDetails } from "../models/userDetails.model.js";
import { SignupDetails } from "../models/idType.models.js";
import { bloodBank } from "../models/bloodbank.schema.js";
import { CampDetails } from "../models/camps.models.js";
import { fetchLocationDetails } from "../utils/googleMaps.js"; // Import the utility function
import { NgoDetails } from "../models/ngo.models.js";

// Retrieve user profile
const userProfile = asyncHandler(async (req, res) => {
    const user= req.loginUser;

    // we already got user in veriy with name loginUser
    // const userPrimaryDetails = await SignupDetails.findById(userTypeId);
    
    // if (!userPrimaryDetails) {
    //     throw new ApiError(404, "User details not found.");
    // }

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

    return res.status(200).json(new ApiResponse(200, "User details retrieved successfully", { details: secondaryDetails }));
});


const donorProfile = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    const userPrimaryDetails = await UserDetails.findById(req.loginUser._id);

    if (!userPrimaryDetails) {
        throw new ApiError(404, "User details not found.");
    }

    const secondaryDetails = await UserDetails.findById(req.loginUser.id_details)
        .select("-contactList -priorityList -signup");

    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const readyToDonateEntry = secondaryDetails.readyToDonate.find(entry => entry.user_id.toString() === userId);

    if (!readyToDonateEntry) {
        throw new ApiError(401, "Not allowed");
    }

    const donor = await UserDetails.findById(userId);

    if (!donor) {
        throw new ApiError(404, "Donor details not found.");
    }

    return res.status(200).json(new ApiResponse(200, "Donor details retrieved successfully", { DonorDetails: donor }));
});

const campUserArea = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;
    // we already got user in veriy with name loginUser
    // const userPrimaryDetails = await SignupDetails.findById(userTypeId);
    
    // if (!userPrimaryDetails) {
    //     throw new ApiError(404, "User details not found.");
    // }

    if (req.loginUser.type !== "user") {
        throw new ApiError(400, "Invalid user type.");
    }

    if (!req.loginUser.id_details) {
        throw new ApiError(400, "User details are incomplete.");
    }

    const secondaryDetails = await UserDetails.findById(req.loginUser.id_details).select("-contactList -priorityList -signup");
    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const state = secondaryDetails.location.state;

    const camps = await CampDetails.find({ 'location.state': state }).select('-donorsRegister -volunteersRegister');
    
    return res.status(200).json(new ApiResponse(200, "Camps in the user's state", { CampsDetails: camps }));
});


const bloodBankUserArea = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    if (req.loginUser.type !== "user") {
        throw new ApiError(400, "Invalid user type.");
    }

    if (!req.loginUser.id_details) {
        throw new ApiError(400, "User details are incomplete.");
    }

    const secondaryDetails = await UserDetails.findById(req.loginUser.id_details).select("-contactList -priorityList -signup");
    if (!secondaryDetails) {
        throw new ApiError(500, "Failed to fetch user details.");
    }

    const state = secondaryDetails.location.state;

    const bloodBanks = await bloodBank.find({ 'location.state': state });
    
    return res.status(200).json(new ApiResponse(200, "Blood banks in the user's state", { bloodBanks: bloodBanks }));
});


// Update user profile details
const userProfileDetails = asyncHandler(async (req, res) => {
    const { userName, bloodGroup, gender, location , dob, email,last_donation_date} = req.body;

    if (![userName, bloodGroup, gender, dob, email, last_donation_date].every((field) => typeof field === 'string' && field.trim() !== '')) {
        throw new ApiError(400, "All details are required.");
    }
    if (!location || typeof location !== 'object' || Object.keys(location).length === 0 || !location.latitude || !location.longitude || typeof location.latitude !== 'string' || typeof location.longitude !== 'string' || location.latitude.trim() === '' || location.longitude.trim() === '') {
        throw new ApiError(400, "Location details are required.");
    }    

    const userTypeId = req.loginUser._id;
    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (!userPrimaryDetails) {
        throw new ApiError(404, "User details not found.");
    }

    const { latitude, longitude } = location;

    // Fetch location details from Google Maps API
    const googleMapsData = await fetchLocationDetails(latitude, longitude);

    // Create user details with retrieved information
    const userDetails = await UserDetails.create({
        userName,
        bloodGroup,
        gender,
        location: {
            latitude,
            longitude,
            state: googleMapsData.state,
            country: googleMapsData.country,
            postalCode: googleMapsData.postalCode
        },
        signup: userPrimaryDetails._id,
        email,
        dob,
        lastdonation:last_donation_date
    });

    if (!userDetails) {
        throw new ApiError(500, "Failed to store user details.");
    }

    userPrimaryDetails.id_details = userDetails._id;
    await userPrimaryDetails.save();

    return res.status(201).json(new ApiResponse(201, "User details stored successfully."));
});

const userNgoinfo = asyncHandler(async (req, res) => {
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

    const { ngoId } = req.body;

    if (!ngoId || !ngoId.trim()) {
        throw new ApiError(400, "Ngo ID is required.");
    }

    const ngoInfo = await NgoDetails.findById(ngoId).select("-signup -ngoHeadContact -ngoHeadAddress -ngoHeadEmail -ngoHeadDob -ngoHeadGender -location.coordinates");

    if (!ngoInfo) {
        throw new ApiError(404, "Ngo details not found.");
    }

    return res.status(200).json(new ApiResponse(200, "Ngo details", { ngoProfile: ngoInfo }));
});


const userCampInfo = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;

    // We already got the user in verify with the name loginUser
    // const userPrimaryDetails = await SignupDetails.findById(userTypeId);
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

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(400, "Ngo ID is required.");
    }

    // Construct the aggregation pipeline to retrieve camp details
    const pipeline = [
        { $match: { _id: mongoose.Types.ObjectId(campId) } }, // Match the camp by its ID
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
                            count: { $cond: { if: { $eq: ["$$donor.status", 1] }, then: 1, else: 0 } } // Count donors with status 1
                        }
                    }
                }
            }
        }
    ];

    const campInfo = await CampDetails.aggregate(pipeline);

    if (!campInfo || campInfo.length === 0) {
        throw new ApiError(404, "Ngo details not found.");
    }

    // Return the response in the desired format
    return res.status(200).json({
        status: 200,
        message: "Camp details",
        data: {
            campProfile: campInfo[0] // We assume there's only one camp profile
        }
    });
});


const userVolunteerApply = asyncHandler(async (req, res) => {
    const loginUser = req.loginUser;

    if (!loginUser) {
        throw new ApiError(401, "User not authenticated.");
    }

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

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "CampId invalid");
    }

    const campInfo = await CampDetails.findById(campId);

    if (!campInfo) {
        throw new ApiError(404, "Camp not found.");
    }

    const currentDate = new Date();
    if (currentDate > campInfo.donationEndDate) {
        return res.status(205).json(new ApiResponse(205, "The camp is not currently active."));
    }

    const currentHour = currentDate.getHours();
    if (currentHour > campInfo.donationsEndTime) {
        return res.status(206).json(new ApiResponse(206, "Volunteering hours are over for today."));
    }

    // Check if the user has already applied or declined
    const isApplied = campInfo.volunteersRegister.some(volunteer => volunteer.user_id.equals(secondaryDetails._id));
    if (isApplied) {
        return res.status(201).json(new ApiResponse(201, "User has already applied."));
    }

    // Add the volunteer to the camp's volunteer register
    campInfo.volunteersRegister.push({ user_id: secondaryDetails._id });
    await campInfo.save();

    // Add the camp to the volunteer's volunteer experience
    secondaryDetails.volunteerExperience.push({ campId: campInfo._id });
    await secondaryDetails.save();

    // Return success response
    return res.status(200).json(new ApiResponse(200, "Volunteer applied successfully."));
});


const userDonorCampApply = asyncHandler(async (req, res) => {
    const loginUser = req.loginUser;

    if (!loginUser) {
        throw new ApiError(401, "User not authenticated.");
    }

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

    const { campId } = req.body;

    if (!campId || !campId.trim()) {
        throw new ApiError(401, "CampId invalid");
    }

    const campInfo = await CampDetails.findById(campId);

    if (!campInfo) {
        throw new ApiError(404, "Camp not found.");
    }

    const currentDate = new Date();
    if (currentDate > campInfo.donationEndDate) {
        return res.status(205).json(new ApiResponse(205, "The camp is not currently active."));
    }

    const currentHour = currentDate.getHours();
    if (currentHour > campInfo.donationsEndTime) {
        return res.status(206).json(new ApiResponse(206, "Donation hours are over for today."));
    }

    // Check if the user has already applied or declined
    const isApplied = campInfo.donorsRegister.some(donor => donor.donor.equals(secondaryDetails._id));
    if (isApplied) {
        return res.status(201).json(new ApiResponse(201, "User has already applied."));
    }

    // Add the donor to the camp's donor register
    campInfo.donorsRegister.push({ donor: secondaryDetails._id, bloodType: secondaryDetails.bloodGroup });
    await campInfo.save();

    // Add the camp to the donor's donation history
    secondaryDetails.donations.push({ campId: campInfo._id });
    await secondaryDetails.save();

    // Return success response
    return res.status(200).json(new ApiResponse(200, "Donor applied successfully."));
});


export { userProfileDetails,
      donorProfile,
      userProfile,
       campUserArea,
        bloodBankUserArea,
       userVolunteerApply,
       userDonorCampApply };
