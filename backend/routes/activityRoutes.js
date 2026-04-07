// authentication endpoints 

import express from "express";
import activityController from "../controllers/activityController.js";

const router = express.Router();

router.get("/", activityController.getActivities); // gets all activities in the database

export default router; 