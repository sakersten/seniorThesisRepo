// authentication endpoints 

import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", authController.googleLogin);       // Google OAuth login
router.post("/logout", authController.logout);           // logout
router.get("/am-i-loggedin", authController.checkLogin); // get currently logged-in user

export default router; 