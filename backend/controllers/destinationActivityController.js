// handles destination activity database functionality

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import dotenv from 'dotenv'; 
dotenv.config(); 

// add a new activity to a destination
const addActivitiesToDestination = async (req, res) => {
  try {
    const { destination_id, activity_ids } = req.body;

    if (!destination_id || !activity_ids) {
      return res.status(400).json({ error: "Missing destination_id or activity_ids" });
    }

    await db.addActivitiesToDestination(destination_id, activity_ids);

    res.status(201).json({ message: "Activities added to destination" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all activities for a destination 
const getActivitiesForDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const activities = await db.getActivitiesForDestination(destinationId);

    res.json(activities);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export default {
    addActivitiesToDestination, 
    getActivitiesForDestination
}