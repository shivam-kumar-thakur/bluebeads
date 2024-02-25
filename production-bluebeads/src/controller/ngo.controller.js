// Import required modules
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { NgoDetails } from "../models/ngo.models.js";
import { SignupDetails } from "../models/idType.models.js";
import { CampDetails } from "../models/camps.models.js";
import { fetchLocationDetails } from "../utils/googleMaps.js"; // Import the utility function

const ngoProfile = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;
    const userPrimaryDetails = await SignupDetails.findById(userTypeId);
    
    if (!userPrimaryDetails) {
        throw new ApiError(404, "User details not found.");
    }

    if (userPrimaryDetails.type !== "ngo") {
        throw new ApiError(400, "User is not an NGO.");
    }

    if (!userPrimaryDetails.id_details) {
        throw new ApiError(400, "Fill user details first.");
    }

    const secondaryDetails = await NgoDetails.findById(userPrimaryDetails.id_details).select("-signup -ngoHeadAddress -ngoHeadDob");
    if (!secondaryDetails) {
        throw new ApiError(404, "NGO details not found.");
    }

    const overallData = {
        totalcamp: secondaryDetails.camps.length,
        totalVoulntersRegister: 0,
        totalDonorsRegister: 0,
        totalPersonsDonated: 0,
        bloodGroups: {
            "A+": 0,
            "A-": 0,
            "B+": 0,
            "B-": 0,
            "AB+": 0,
            "AB-": 0,
            "O+": 0,
            "O-": 0
        }
    };

    for (const campId of secondaryDetails.camps) {
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
                            in: "$$donor.bloodType"
                        }
                    }
                }
            }
        ];

        const campAggregateResult = await CampDetails.aggregate(pipeline);

        if (campAggregateResult.length > 0) {
            const campData = campAggregateResult[0];
            overallData.totalVoulntersRegister += campData.noOfVolunteers || 0;
            overallData.totalDonorsRegister += campData.noOfDonorsRegister || 0;
            overallData.totalPersonsDonated += campData.noOfDonorsRegister || 0;

            // Update blood group totals
            campData.donationsInfo.forEach(bloodType => {
                overallData.bloodGroups[bloodType] += 1; // Increment count for the blood group
            });
        }
    }

    return res.status(200).json(new ApiResponse(200, "NGO details retrieved successfully", { details: secondaryDetails, overallData }));
});

// output of above
// {
//     "status": 200,
//     "message": "NGO details retrieved successfully",
//     "data": {
//       "details": {
//         "_id": "ngo_id",
//         "name": "NGO Name",
//         // Other NGO details
//         "camps": ["camp_id1", "camp_id2", "camp_id3"]
//       },
//       "overallData": {
//         "totalcamp": 3,
//         "totalVoulntersRegister": 120,
//         "totalDonorsRegister": 80,
//         "totalPersonsDonated": 50,
//         "bloodGroups": {
//           "A+": 20,
//           "A-": 15,
//           "B+": 10,
//           "B-": 8,
//           "AB+": 6,
//           "AB-": 4,
//           "O+": 10,
//           "O-": 7
//           // other blood groups
//         }
//       }
//     }
//   }
  

// ngoProfileDetails function to handle NGO profile creation
const ngoProfileDetails = asyncHandler(async (req, res) => {
    const userTypeId = req.loginUser._id;
    const userPrimaryDetails = await SignupDetails.findById(userTypeId);

    if (!userPrimaryDetails) {
        throw new ApiError(404, "User details not found.");
    }

    const { ngo_name, ngo_description, location, ngo_head,head_phone,head_gmail,head_address,head_dob,head_gender} = req.body;

    if (![ngo_name, ngo_description, ngo_head, head_phone, head_gmail, head_address, head_dob, head_gender].every((field) => field && typeof field === 'string' && field.trim() !== '')) {
        if (!location || !location.latitude || !location.longitude || typeof location.latitude !== 'string' || typeof location.longitude !== 'string' || location.latitude.trim() === '' || location.longitude.trim() === '') {
            throw new ApiError(400, "All details are required.");
        }
    }

    // Regular expression to match the international phone number format
    const phoneNumberRegex = /^\+\d{1,3}\d{6,14}$/;

    if (!phoneNumberRegex.test(head_phone)) {
        throw new ApiError(400, "Invalid phone number format.");
    }

    // Fetch location details from Google Maps API
    const googleMapsData = await fetchLocationDetails(location.latitude, location.longitude);

    const ngoDetails = await NgoDetails.create({
        ngo_name,
        ngo_description,
        location: {
            coordinates: [location.latitude, location.longitude],
            state: googleMapsData.state,
            country: googleMapsData.country,
            postalCode: googleMapsData.postalCode
        },
        signup: userPrimaryDetails._id,
        ngoHeadName:ngo_head,
        ngoHeadContact:head_phone,
        ngoHeadEmail:head_gmail,
        ngoHeadAddress:head_address,
        ngoHeadDob:head_dob,
        ngoHeadGender:head_gender
    });

    if (!ngoDetails) {
        throw new ApiError(500, "Failed to store NGO details.");
    }

    userPrimaryDetails.id_details = ngoDetails._id;
    await userPrimaryDetails.save();

    // you can send data but its no use.
    return res.status(201).json(new ApiResponse(201, "NGO details stored successfully.", { }));
});

export { ngoProfile, ngoProfileDetails };
