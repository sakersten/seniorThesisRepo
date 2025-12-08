// authentication endpoints 

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.googleLogin);       // Google OAuth login
router.post("/logout", authController.logout);           // logout
router.get("/am-i-loggedin", authController.checkLogin); // get currently logged-in user

module.exports = router;