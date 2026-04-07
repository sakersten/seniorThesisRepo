// defines the URL endpoints and points each request to the correct controller function

import express from "express";
import destinationController from "../controllers/destinationController.js";

const router = express.Router();

router.get("/countries", destinationController.getAllCountries); 
router.get("/states/:countryId", destinationController.getAllStatesByCountry); 
router.get("/cities/state/:stateId", destinationController.getAllCitiesByState); 
router.get("/cities/country/:countryId", destinationController.getAllCitiesByCountry); 

// router.get("destinations", destinationController.getAllDestinationsByUser); TO-DO
router.delete("/search", destinationController.deleteDestination); 

export default router; 