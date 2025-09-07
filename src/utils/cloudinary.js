import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dkjgwiyfr",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
});


// Upload an image
const uploadOnCloudnary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //fie has uploaded successfully
    console.log("file has upoloaded successfully", response.url);
    return response;
  } catch (error) {
    fs.unlink(localFilePath) //remove  loacally teparary uploaded  file as the file opration got failed
    return null;
  }
};

exports={uploadOnCloudnary}



