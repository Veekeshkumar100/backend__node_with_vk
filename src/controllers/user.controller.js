import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { APiResponce } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import jwt  from "jsonwebtoken";
import mongoose from "mongoose";


const refreashtokenAndAccessToken=async(userId)=>{
  try {
    const user=await User.findById(userId);
    const accessToken= user.generateAccessToken();
    const refreashToken= user.generateRefreashToken();
         user.refrenceToken=refreashToken; 
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
     const loggedInUser=await User.findById(user._id
      
      
     ).select("-password -refrenceToken");
  

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
      $unset: {refrenceToken:1} //this rmon=ve the fiel from field
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
        const  incommingRefreashToken= req.cookies?.refreashToken || req.body.refreashToken;
        
        if (!incommingRefreashToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

      console.log(incommingRefreashToken)

        const decodedToken = jwt.verify(
            incommingRefreashToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id);
        
        if (!user) {
            throw new ApiError(401, "User does not exist");
        }
        console.log(user);

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
  // console.log("curUser",req.user);
   const {oldpassword,newpassword}=req.body;
   console.log(oldpassword,newpassword);

   if(!oldpassword || !newpassword){
     throw new ApiError(400,"All fields are required");
   }

           const user=await User.findById(req.user._id);
      if(!user){
        throw new ApiError(404,"user is not found");
      }
        
      const isPosswordCurrect= await user.isPosswordCurrect(oldpassword);
      if(!isPosswordCurrect){
        throw new ApiError(401,"old password is not currect");
      }     
      user.password=newpassword;
      await user.save({validateBeforeSave:true});
      return res.status(200).json(new APiResponce(200,{},"password has changed successfully"))

})

export const getUser=asyncHandler(async(req,res,next)=>{

   return res.status(200).json(
    new APiResponce(200,req.user,"user is fetched succesfully")
   )
});

export const updateUserDetailes=asyncHandler(async(req,res,next)=>{
  const {fullName,email}=req.body;
  console.log("body",req.body);
  if([fullName,email].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"All the field are required");
  }
     const user=await User.findByIdAndUpdate(req.user._id,{
      $set: {fullName,email}
     },
    {new:true}).select("-password ");
   return res.status(200).json(
    new APiResponce(200,user,"user is updated succesfully")
   )
})


export const updateUserAvatar=asyncHandler(async(req,res,next)=>{
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
export const updateUserCoverImage=asyncHandler(async(req,res,next)=>{
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
  )
.select("-password ");
console.log(user);

  return res.status(200).json(200,user,"avatar has updated succesfully")
})


export const getUserChannelProfile=asyncHandler(async(req,res,next)=>{
  const {username}=req.params;
    if(!username){
      throw new ApiError(400,"ChannelName is missing");
    }

      const channel=await User.aggregate([
        {$match:{username:username?.toLowerCase()}},
        {
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subcribers"
        
        }
      },
        {
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subcriber",
            as:"subcribedTo"
        }
      },
        {
          $addFields:{
            subscriberCount:{$size:"$subcribers"},
            channelSubscribedCount:{$size:"$subcribedTo"},
            isSubscribed:{
              $cond:{
                if:{$in:[req.user?._id,"$subcribers.subcriber"]},
                then:true,
                else:false,
              }
            }
          }
        },
        {$project:{
          fullName:1,
          username,
          subscriberCount:1,
          channelSubscribedCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
          email:1,
        }},

      
      ])
     if(!channel?.length){
      throw new ApiError(401,"channel does not  exists")
     }

     return res.status(200).json(new APiResponce(200,channel[0],"channel does not fetched"));
})

 


export const getUserWatchHistory=asyncHandler(async(req,res,next)=>{
      
  const user=await User.aggregate([
    {$match: {_id:new mongoose.Types.ObjectId(req.user._id)}},
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
         as:"watchHistory",
         pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1,
                  }

                }
              ]

            }
          },{
              $addFields:{
                owner:{
                  $first:"$owner",
                }
              }
          }
         ]
      }
    } 
    
  ])

  return res.status(200).json(new APiResponce(200,user[0].watchHistory,"watch history fetch succeccfull"))


})