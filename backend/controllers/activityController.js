// handles activity database functionality

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import dotenv from 'dotenv'; 
dotenv.config(); 

const getActivities = async (req, res) => {
  try {
    const activities = await db.getActivities();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
    getActivities
}