// SQL for trip functionality

// PostgreSQL connection
const pool = require('../db'); 

// get all trips for a specific user
exports.getAllTripsByUserId = async (userId) => {
    try {
        const sql = `
            SELECT
                trip_id, 
                user_id, 
                title, 
                start_date, 
                end_date, 
                notes
            FROM Trips
            WHERE user_id = $1
            ORDER BY start_date ASC;
        `;

    const result = await pool.query(sql, [userId]);
    return result.rows; // array of trips
    } catch (err) {
        throw err;
    }
}; 