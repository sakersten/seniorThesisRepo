import express from "express";
import tripController from "../controllers/tripController.js";

const router = express.Router();

router.post("/new-trip", tripController.createTrip);                  // create a new trip
router.get("/upcoming-trips", tripController.getUpcomingTripsByUser); // get all upcoming trips for a given user
router.get("/past-trips", tripController.getPastTripsByUser);         // get all past trips for a given user
router.patch("/update-trip/:id", tripController.updateTrip);          // update a trip
router.delete("/delete/:id", tripController.deleteTrip);              // delete a trip

export default router; 