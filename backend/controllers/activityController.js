// controller layer for activities; handles API requests and returns activity data from the database

import activityService from "../services/activityService.js";
import dotenv from 'dotenv'; 
dotenv.config(); 

const getActivities = async (req, res) => {
  try {
    const activities = await activityService.getActivities();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
    getActivities
}