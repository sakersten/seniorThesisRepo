// defines the URL endpoints and points each request to the correct controller function

import express from "express";
import weatherController from "../controllers/weatherController.js";

const router = express.Router();

router.get("/current", weatherController.getForecastWeather); 
router.get("/historic", weatherController.getHistoricWeather); 

export default router; 