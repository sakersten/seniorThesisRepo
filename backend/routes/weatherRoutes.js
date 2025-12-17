// defines the URL endpoints and points each request to the correct controller function

const express = require("express");
const router = express.Router();

const weatherController = require("../controllers/weatherController.js");

router.get("/", weatherController.getCurrentWeather); 
router.get("/historic", weatherController.getHistoricWeather); 

module.exports = router;