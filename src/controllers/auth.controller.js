import  jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";


export const verifyjwt=asyncHandler(async(req,res,next)=>{
try {
  
    const token =req.cookies?.acccessToken || req.header("Authorization")?.replace("Bearer","");
    console.log("token",token);

    if(!token){
        throw new ApiError(401,"Unauthorized request");
    }

    const decodedUser=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    if(!decodedUser){
        throw new ApiError(500,"somthing went wromg");
    }

    const user=User.findById(decodedUser._id);

    if (!user) {
        throw new ApiError(401,"user does not exist");
    }
     
    req.user=user;
    next();

    
} catch (error) {
    console.log(error)
    throw new ApiError(401, error.message || " invailid user token");
}

})