// closet endpoints 

import express from "express";
import closetController from "../controllers/closetController.js";

const router = express.Router();

router.post("/new-closet-item", closetController.createClosetItem); // create item       
router.get("/", closetController.getClosetItems);                   // get all items
router.get("/category", closetController.getClosetByCategory);      // filter by category/subcategory
router.get("/weather", closetController.getClosetByWeather);        // filter by weather
router.delete("/:id", closetController.deleteClosetItem);           // delete item

export default router; 