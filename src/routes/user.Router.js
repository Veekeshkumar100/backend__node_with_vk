import express from "express";
import { changeCurrentPassword, getUser, getUserChannelProfile, getUserWatchHistory, loginUser, logoutUser, refreashAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetailes } from "../controllers/user.controller.js";
import { upload } from "../middlwares/multer.js";
import { verifyjwt } from "../controllers/auth.controller.js";

const Router = express.Router();

Router.route("/register").post(
  upload.fields([
    {
      name: 'avatar',
      maxcount: 1,
    },
    {
      name: 'coverImage',
      maxcount: 1,
    },
  ]),
  registerUser
);
Router.route("/login").post(loginUser);
Router.route("/logout").post(verifyjwt,logoutUser);
Router.route("/refreash-token").post(refreashAccessToken);
Router.route("/chanage-password").post(verifyjwt,changeCurrentPassword);
Router.route("/UpdateUserDetails").post(verifyjwt,updateUserDetailes);
Router.route("/get-user").get(verifyjwt,getUser);
Router.route("/avatar").post(verifyjwt,upload.single("avatar"),updateUserAvatar)
Router.route("/cover-image").post(verifyjwt,upload.single("coverImage"),updateUserCoverImage)
Router.route("/c/:ChannelName").post(verifyjwt,getUserChannelProfile);
Router.route("/history").post(verifyjwt,getUserWatchHistory);



export default Router;
