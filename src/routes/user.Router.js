import express from "express";
import { changeCurrentPassword, getUser, loginUser, logoutUser, refreashAccessToken, registerUser, updateUserAvatar, updateUserDetailes } from "../controllers/user.controller.js";
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
Router.route("/password").post(verifyjwt,changeCurrentPassword);
Router.route("/UpdateUserDetails").post(verifyjwt,updateUserDetailes);
Router.route("/get-user").get(verifyjwt,getUser);
Router.route("/updateUserAvatar",upload.single("avatar"),verifyjwt,updateUserAvatar)

export default Router;
