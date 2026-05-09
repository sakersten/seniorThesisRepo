// gathers trip data, destinations, activities, and weather 

import express from "express";
import packingController from "../controllers/packingController.js";

const router = express.Router();

router.post("/generate/:tripId", packingController.generatePackingList);
router.get("/:tripId", packingController.getPackingList);
router.patch("/items/:itemId/toggle", packingController.togglePacked);

export default router; 