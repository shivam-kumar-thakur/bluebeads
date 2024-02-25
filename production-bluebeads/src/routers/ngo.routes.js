import { Router } from "express";
import {verifyJWT,verifyJWTLogin,verifyJWTRegister} from "../middlewares/auth.middleware.js"; 

const ngoRouter=Router();

//controllers
import { ngoProfile, ngoProfileDetails } from  "../controller/ngo.controller.js";

//routes
ngoRouter.route("/ngo-profile").get(verifyJWT,ngoProfile);
ngoRouter.route("/ngo-details").post(verifyJWT,ngoProfileDetails);

export default ngoRouter;