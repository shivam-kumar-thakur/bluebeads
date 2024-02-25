import {Router} from "express";
import {verifyJWT,verifyJWTLogin,verifyJWTRegister} from "../middlewares/auth.middleware.js"; 
const generalRouter=Router();

// controllers
import {
    // OTPAuthRegisterSend,
    // OTPAuthRegisterCheck,
    // OTPAuthLoginSend,
    // OTPAuthLoginCheck,
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
} from "../controller/general.controller.js"; 


// public routes
// generalRouter.route("/register").post(OTPAuthRegisterSend);
// generalRouter.route("/verify-phone").post(verifyJWTLogin,OTPAuthRegisterCheck);
// generalRouter.route("/login").post(OTPAuthLoginSend);
// generalRouter.route("/otp-verify").post(verifyJWTRegister,OTPAuthLoginCheck);

generalRouter.route("/register").post(registerUser);
generalRouter.route("/login").post(loginUser);

//protected Routes
generalRouter.route("/logout").patch(verifyJWT,logoutUser);
generalRouter.route("/refresh-tocken").patch(verifyJWT,refreshAccessToken);
generalRouter.route("/change-password").patch(verifyJWT,changeCurrentPassword);
generalRouter.route("/current-user").get(verifyJWT,getCurrentUser);

export default generalRouter;
