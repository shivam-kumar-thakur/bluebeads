import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { SignupDetails } from "../models/idType.models.js";
import { RegisterAuth } from "../models/registerWaiting.model.js";
import { loginAuth } from "../models/loginWaiting.models.js";


const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Check if the access token is provided in cookies or headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // If no token is provided, return Unauthorized
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the access token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token
        const user = await SignupDetails.findById(decodedToken.userId).select("-password -refreshToken");

        // If user not found, return Unauthorized
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Assign the logged-in user to the request object
        req.loginUser = user;
        next();
    } catch (error) {
        // If any error occurs during verification, return Unauthorized with an appropriate message
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});


const verifyJWTRegister = asyncHandler(async (req, res, next) => {
    try {
        // Check if the access token is provided in cookies or headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // If no token is provided, return Unauthorized
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the access token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token
        const user = await RegisterAuth.findById(decodedToken.userId);

        // If user not found, return Unauthorized
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Assign the logged-in user to the request object
        req.authUser = user;
        next();
    } catch (error) {
        // If any error occurs during verification, return Unauthorized with an appropriate message
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

const verifyJWTLogin = asyncHandler(async (req, res, next) => {
    try {
        // Check if the access token is provided in cookies or headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // If no token is provided, return Unauthorized
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the access token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token
        const user = await loginAuth.findById(decodedToken.userId);

        // If user not found, return Unauthorized
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Assign the logged-in user to the request object
        req.authUser = user;
        next();
    } catch (error) {
        // If any error occurs during verification, return Unauthorized with an appropriate message
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export {verifyJWT,verifyJWTLogin,verifyJWTRegister}
