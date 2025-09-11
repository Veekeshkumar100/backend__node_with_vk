import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { APiResponce } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import jwt  from "jsonwebtoken";


const refreashtokenAndAccessToken=async(userId)=>{
  try {
    const user=await User.findById(userId);
    const accessToken= user.generateAccessToken();
    const refreashToken= user.generateRefreashToken();
         user.refreashToken=refreashToken; 
    // console.log("user",user);
    await user.save({ validateBeforeSave : true });
    // console.log("refresh",refreshToken);

    console.log("accessToken,refreashToken2",accessToken,refreashToken);
        return {accessToken,refreashToken};
  } catch (error) {
     console.log(error);
     throw new ApiError(500,"something went wrong while generating token")
  }
      
}

export const registerUser = asyncHandler(async (req, res) => {
  //get user detaile from the frontend
  //validate - the user detailes
  //check if the user is already is exsist or not
  //check for the image and avatar
  //upload them on the cloudinary
  //create the user object -create entry in db
  // remove the password and refreashtoken field
  //return response

  const { fullName, username, email ,password,refreshToken} = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All the field are required");
  }

  // console.log("file",req.files)
  //  console.log("body",req.body)

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
//   console.log("existingUser",existingUser)
  if (existingUser) {
    throw new ApiError(409, "user is already exist");
  }
   
  const avatarLocalPath = req.files?.avatar[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage[0]?.path;
// let avatarLocalPath;
//   if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
//     avatarLocalPath = req.files.avatar[0].path;
//   }
let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(409, "avatar file is required");
  }

  const avatar = await uploadOnCloudnary(avatarLocalPath);
//   console.log("avatar",avatar)
  if (!avatar) {
    throw new ApiError(409, "avatar file is required");
  }
  const coverImage = await uploadOnCloudnary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    refreshToken: refreshToken || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

//   console.log("createdUser",createdUser)
  if (!createdUser) {
    throw new ApiError(500, "someting went wrong");
  }

  return res
    .status(200)
    .json(new APiResponce(200, createdUser, "USer is created succesfully"));
});


export const loginUser=asyncHandler(async (req, res) => {
  //get user detaile from the frontend
  //find the user
  //validate the user data from se  rver register user
  //send the token to the user
    //  console.log("veekesh")
     const {username,email,password}=req.body;
    //  console.log(req.body);
     
     if((!username && !email)){
      throw new ApiError(409,"username or  email is required");
     }


    //  if(!(username || email)){
    //   throw new ApiError(409,"username or  email is required");
    //  }

     const user = await User.findOne({
      $or:[{username},{email}]
     });

     if(!user){
      throw new ApiError(401,"username or email is not currect");
     }

     const isPosswordvalid= await user.isPosswordCurrect(password);


     if(!isPosswordvalid){
      throw new ApiError(401,"password is not currect");
     }

     
  
     const {accessToken,refreashToken}= await refreashtokenAndAccessToken(user._id);

     console.log("accessToken,refreashToken",accessToken,refreashToken);
     const loggedInUser=await User.findById(user._id).select("-password -refrenceToken");

     const option={
      httpOnly:true,
      secure:true
     }

    return res.status(200)
    .cookie("acccessToken",accessToken,option)
    .cookie("refreashToken",refreashToken,option)
    .
    json(
        new APiResponce(200,
          {
          user:loggedInUser,accessToken,refreashToken
        }
      )
    )

})


export const logoutUser=asyncHandler(async(req,res,next)=>{
  
   await User.findByIdAndUpdate(req.user._id,
    {
      $set: {refrenceToken:"undefind"}
    },
    {
      new:true,
    }
  );
   
     const option={
      httpOnly:true,
      secure:true
     }

// console.log(user);
     return res.status(200)
     .clearCookie('acccessToken',option)
     .clearCookie('refreashToken',option)
     .json( new APiResponce(200,{},"user has logout succeesfuly") )


})


export const  refreashAccessToken=asyncHandler(async(req, res) => {
    try {
        const incommingRefreashToken = req.cookies?.refreashToken || req.body.refreashToken;
        
        if (!incommingRefreashToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const decodedToken = jwt.verify(
            incommingRefreashToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);
        
        if (!user) {
            throw new ApiError(401, "User does not exist");
        }

        if (user.refreashToken !== incommingRefreashToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const {accessToken, refreashToken} = await refreashtokenAndAccessToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreashToken", refreashToken, options)
            .json(
                new APiResponce(
                    200,
                    { accessToken, refreashToken },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export  const  changeCurrentPassword=asyncHandler(async(req,res,next)=>{
   const {oldpassword,newpassword}=req.body;
      
           const user=await User.findById(req.user._id);
        
      const isPosswordCurrect= await user.isPosswordCurrect(oldpassword);
      if(!isPosswordCurrect){
        throw new ApiError(401,"old password is not currect");
      }     
      user.password=newpassword;
      await user.save({validateBeforeSave:true});
      return res.status(200).json(new APiResponce(200,{},"password has changed successfully"))

})

export const gerUser=asyncHandler(async(req,res,next)=>{

   return res.status(200).json(
    new APiResponce(200,req.user,"user is fetched succesfully")
   )
});

export const updateUserDetailes=asyncHandler(async(req,res,next)=>{
  const {fullName,email}=req.body;
  if([fullName,email].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"All the field are required");
  }
     const user=await User.findByIdAndUpdate(req.user._id,{
      $set: {fullName,email}
     },
    {new:true}).select("-password -refrenceToken");
   return res.status(200).json(
    new APiResponce(200,user,"user is updated succesfully")
   )
})


export const updateUserAvatar=asyncHandeler(async(req,res,next)=>{
  const avatarLocalPath=req.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required");
  }

  const avatar=await uploadOnCloudnary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(500,"somthing went wrong while uploading avatar");
  }

  const user=await User.findByIdAndUpdate(req.user._id,
    {
      $set: {avatar:avatar.url}
    },
    {new:true}
  ).
select("-password ");

  return res.status(200).json(200,user,"avatar has updated succesfully")
})
export const updateUserCoverImage=asyncHandeler(async(req,res,next)=>{
  const coverImageLocalPath=req.file?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400,"coverImage file is required");
  }

  const coverImage=await uploadOnCloudnary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(500,"somthing went wrong while uploading cover image");
  }

  const user=await User.findByIdAndUpdate(req.user._id,
    {
      $set: {coverImage:coverImage.url}
    },
    {new:true}
  ).
select("-password ");

  return res.status(200).json(200,user,"avatar has updated succesfully")
})