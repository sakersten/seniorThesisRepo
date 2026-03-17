// destinationController.js
const dotenv = require('dotenv');
dotenv.config(); // do NOT pass './.env', just call dotenv.config()

exports.searchDestination = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City query parameter is required' });

  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    // Check if data is actually an array
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Unexpected geocoding response:', data);
      console.log("OPENWEATHER_KEY:", process.env.OPENWEATHER_API_KEY);
      return res.status(404).json({ error: 'City not found' });
    }

    const results = data.map(d => ({
      city: d.name,
      state: d.state || "",       
      country: d.country,
      latitude: d.lat,
      longitude: d.lon
    }));

    res.json(results);
  } catch (err) {
    console.error('Geocoding API error:', err);
    res.status(500).json({ error: 'Failed to fetch destination data' });
  }
};