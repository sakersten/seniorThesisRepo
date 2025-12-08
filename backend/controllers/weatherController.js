// handles pulling the weather

const dotenv = require('dotenv');
dotenv.config(); // do NOT pass './.env', just call dotenv.config()

exports.getWeather = async (req, res) => {
  const { latitude, longitude } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
};