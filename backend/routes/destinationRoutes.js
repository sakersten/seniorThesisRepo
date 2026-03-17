// defines the URL endpoints and points each request to the correct controller function

const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

router.get("/search", destinationController.searchDestination); 

module.exports = router;