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

// // TO-DO
// // get all destinations for a given user
// const getAllDestinationsByUser = async (req, res) => {
//   try {
//     const google_id = req.session.user?.google_id;

//     if (!google_id) {
//       return res.status(401).json({ error: "User not logged in" });
//     }

//     const destinations = await db.getAllDestinationsByUser(google_id);

//     res.json(destinations);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// still needs to be tested
// delete destination
const deleteDestination = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;

    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const trip_id = req.params.id;

    const updatedTrip = await db.removeTripDestination(trip_id, google_id);

    if (!updatedTrip) {
      return res.status(404).json({
        error: "Trip not found or not authorized"
      });
    }

    res.json({
      message: "Destination removed",
      trip: updatedTrip
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
  //getAllDestinationsByUser, 
  deleteDestination
}