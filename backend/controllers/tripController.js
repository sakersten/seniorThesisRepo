// handles trip functionality with the database

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import dotenv from 'dotenv'; 
dotenv.config(); 

const createTrip = async (req, res) => {
  try {
    const { title, start_date, end_date, notes } = req.body;
    
    const google_id = req.session.user.google_id; // from session

    const newTrip = await db.createTrip(google_id, title, start_date, end_date, notes);
    res.status(201).json(newTrip);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all upcoming trips for a user
const getUpcomingTripsByUser = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const trips = await db.getUpcomingTripsByUser(google_id);
    res.json(trips);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all past trips for a user
const getPastTripsByUser = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const trips = await db.getPastTripsByUser(google_id);
    res.json(trips);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// update trip; needs user id validation too
const updateTrip = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const trip_id = req.params.id;

    const {
      title,
      start_date,
      end_date,
      notes
    } = req.body;

    const updatedTrip = await db.updateTrip(
      trip_id,
      google_id,
      title,
      start_date,
      end_date,
      notes
    );

    if (!updatedTrip) {
      return res.status(404).json({
        error: "Trip not found or not authorized"
      });
    }

    res.json(updatedTrip);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// delete for the specific closet item #; needs user id validation too
const deleteTrip = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const trip_id = req.params.id;

    const deletedTrip = await db.deleteTrip(trip_id, google_id);

    if (!deletedTrip) {
      return res.status(404).json({
        error: "Trip not found or not authorized"
      });
    }

    res.json({ message: "Trip deleted", item: deletedTrip });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export default { 
  createTrip, 
  getUpcomingTripsByUser, 
  getPastTripsByUser, 
  updateTrip, 
  deleteTrip
};