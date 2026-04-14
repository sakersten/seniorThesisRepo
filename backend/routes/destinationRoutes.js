// defines the URL endpoints and points each request to the correct controller function

import express from "express";
import destinationController from "../controllers/destinationController.js";

const router = express.Router();

// destination routes for the new destination form dropdowns
router.get("/countries", destinationController.getAllCountries); 
router.get("/states/:countryId", destinationController.getAllStatesByCountry); 
router.get("/cities/state/:stateId", destinationController.getAllCitiesByState); 
router.get("/cities/country/:countryId", destinationController.getAllCitiesByCountry); 

// destination routes for user functionality
router.get("/trip/:tripId", destinationController.getDestinationsByTrip); 
router.post("/new-destination", destinationController.createDestination); 
router.delete("/delete/:id", destinationController.deleteDestination); 

export default router; 