import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dkjgwiyfr", // Add your Cloudinary cloud name here
  api_key: '862594993546569', // Add your Cloudinary API key here
  api_secret: 'NQalZ0QV0vwbyf4W4yEAdmRauFc'

 // Click 'View API Keys' above to copy your API secret
});


// // Upload an image
const uploadOnCloudnary = async (localFilePath) => {
  // console.log("localFilePath",localFilePath);
  try {
    if(!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto",});
  
    // console.log("response",response)
    //fie has uploaded successfully
    fs.unlinkSync(localFilePath)
    // console.log("file has upoloaded successfully", response.url);
    return response;
  } catch (error) {
    console.error("error in uploadOnCloudnary", error.message);
    fs.unlinkSync(localFilePath) //remove  loacally teparary uploaded  file as the file opration got failed
    return null;
  }
};





// // ...existing code...

// const uploadOnCloudnary = async (localFilePath) => {
//   try {
//     if (!localFilePath) {
//       throw new Error("No file path provided");
//     }

//     // Check if file exists
//     if (!fs.existsSync(localFilePath)) {
//       throw new Error("File not found at the specified path");
//     }

//     // Upload to cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     // File uploaded successfully, now remove the local file
//     fs.unlinkSync(localFilePath);
    
//     console.log("File uploaded successfully:", response.url);
//     return response;

//   } catch (error) {
//     console.error("Error in uploadOnCloudnary:", error.message);
    
//     // Clean up local file if it exists
//     if (localFilePath && fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
    
//     return {
//       success: false,
//       error: error.message,
//       url: null
//     };
//   }
// };
// ...existing code...
export {uploadOnCloudnary}