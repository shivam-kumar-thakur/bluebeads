import { Router } from "express";
import {verifyJWT,verifyJWTLogin,verifyJWTRegister} from "../middlewares/auth.middleware.js"; 

const campRouter=Router();

//controllers
import {campCreation,
    campDetailsAdmin,
    campAdminRegister,
    campAdminDonated,
    campAdminVolunter,
    campAdminMarkDonor,
    campAdminUnmarkDonor,
    campAdminVolunterRequests,
    campAdminApproveVolunter,
    campAdminDeclineVolunter
} from "../controller/camps.controller.js";

//routes
campRouter.route("/new-camp").post(verifyJWT,campCreation);
campRouter.route("/camp-admin").post(verifyJWT,campDetailsAdmin);
campRouter.route("/camp-admin/reg").post(verifyJWT,campAdminRegister);
campRouter.route("/camp-admin/donated").post(verifyJWT,campAdminDonated);
campRouter.route("/camp-admin/vol").post(verifyJWT,campAdminVolunter);
campRouter.route("/camp-admin/mark-donor").post(verifyJWT,campAdminMarkDonor);
campRouter.route("/camp-admin/unmark-donor").post(verifyJWT,campAdminUnmarkDonor);
campRouter.route("/camp-admin/vol-request").post(verifyJWT,campAdminVolunterRequests);
campRouter.route("/camp-admin/vol-approve").post(verifyJWT,campAdminApproveVolunter);
campRouter.route("/camp-admin/vol-decline").post(verifyJWT,campAdminDeclineVolunter);

export default campRouter;