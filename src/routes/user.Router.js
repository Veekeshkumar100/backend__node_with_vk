import express from "express";
import { loginUser, logoutUser, refreashAccessToken, registerUser } from "../controllers/user.controller.js";
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

export default Router;
