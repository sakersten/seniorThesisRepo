// authentication endpoints 

import express from "express";
import destinationActivityController from "../controllers/destinationActivityController.js";

const router = express.Router();

router.post("/destination/:destinationId", destinationActivityController.addActivitiesToDestination); // add a new activity to a destination
router.get("/destination/:destinationId", destinationActivityController.getActivitiesForDestination); // get all activities for a destination 

export default router; 