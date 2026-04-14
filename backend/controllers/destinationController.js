// handles destination logic -> uses db tables that are from 'Countries States Cities Database' 

// Data by Countries States Cities Database
// https://github.com/dr5hn/countries-states-cities-database | ODbL v1.0

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import dotenv from 'dotenv'; 
dotenv.config(); 

// get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await db.getCountries();
    res.json(countries);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all states by country id
const getAllStatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    if (!countryId) {
      return res.status(400).json({ error: "countryId is required" });
    }

    const states = await db.getStatesByCountry(countryId);
    res.json(states);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// get all cities by state id (if applicable)
const getAllCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    if (!stateId) {
      return res.status(400).json({ error: "stateId is required" });
    }

    const cities = await db.getCitiesByState(stateId);
    res.json(cities);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all cities by country id (if state is not applicable)
const getAllCitiesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    if (!countryId) {
      return res.status(400).json({ error: "countryId is required" });
    }

    const cities = await db.getCitiesByCountry(countryId);
    res.json(cities);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all destinations for a specific trip
const getDestinationsByTrip = async (req, res) => {
  try {
    const google_id = req.session.userId;
    const { tripId } = req.params;

    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const destinations = await db.getDestinationsByTrip(tripId, google_id);

    res.json(destinations);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// create a new destination in a trip
const createDestination = async (req, res) => {
  try {
    const google_id = req.session.userId;

    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const {
      trip_id,
      destination_name,
      start_date,
      end_date,
      order_index,
      notes,
      city_id,
      state_id,
      country_id, 
      activity_ids
    } = req.body;

    const errors = [];

    // validation checks
    if (!start_date) errors.push("Start date is required");
    if (!end_date) errors.push("End date is required");

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);

      if (start > end) {
        errors.push("Start date cannot be after end date");
      }
    }

    if (!city_id) {
      errors.push("City is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    const newDestination = await db.createDestination({
      trip_id,
      destination_name,
      start_date,
      end_date,
      order_index,
      notes,
      city_id,
      state_id,
      country_id,
      google_id,
      activity_ids
    });

    res.status(201).json(newDestination);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// delete destination
const deleteDestination = async (req, res) => {
  try {
    const google_id = req.session.userId;

    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const destination_id = req.params.id;

    const updatedDestination = await db.removeTripDestination(destination_id, google_id);

    if (!updatedDestination) {
      return res.status(404).json({
        error: "Destination not found or not authorized"
      });
    }

    res.json({
      message: "Destination removed",
      destination_id: destination_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllCountries, 
  getAllStatesByCountry, 
  getAllCitiesByState, 
  getAllCitiesByCountry, 
  getDestinationsByTrip, 
  createDestination,  
  deleteDestination
}