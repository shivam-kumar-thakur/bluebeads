import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// controllers
import { userProfileDetails,
    donorProfile,
    userProfile,
    campUserArea,
    bloodBankUserArea,
    userVolunteerApply,
    userDonorCampApply 
} from "../controller/user.controller.js";

import {newRequestSelf,
    newRequestOther,
    requestStatus
} from "../controller/request.controllers.js";

// routes
userRouter.route("/user-profile").get(verifyJWT,userProfile);
userRouter.route("/user-details").post(verifyJWT,userProfileDetails);
userRouter.route("/donor-profile").get(verifyJWT,donorProfile);
userRouter.route("/camps-user-area").get(verifyJWT,campUserArea);
userRouter.route("/user-area-blood-bank").get(verifyJWT,bloodBankUserArea);
userRouter.route("/camp-info/volunter").post(verifyJWT,userVolunteerApply);
userRouter.route("/camp-info/donor").post(verifyJWT,userDonorCampApply);
userRouter.route("/request-self").post(verifyJWT,newRequestSelf);
userRouter.route("/request-others").post(verifyJWT,newRequestOther);
userRouter.route("/request-status").post(verifyJWT,requestStatus);

export default userRouter;
