const pool = require('../db');

exports.createTrip = async (req, res) => {
  const { user_id, title, start_date, end_date, latitude, longitude, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trips 
       (user_id, title, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, title, start_date, end_date, latitude, longitude, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getTrips = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trips');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};