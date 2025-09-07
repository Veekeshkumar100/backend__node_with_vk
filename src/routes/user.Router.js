import express from "express"
import { registerUser } from "../controllers/user.controller.js";

const Router=express.Router();



Router.route("/register").post(registerUser);


export default Router;