// handles the request logic -> reads inputs, calls model functions, and sends responses

const dotenv = require('dotenv');
dotenv.config(); // do NOT pass './.env', just call dotenv.config()

exports.getCurrentWeather = async (req, res) => {
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

exports.getHistoricWeather = async (req, res) => {
  const { latitude, longitude, start_date, end_date } = req.query; 

  if (!latitude || !longitude || !start_date || !end_date) {
    return res.status(400).json({
      error: "Missing latitude, longitude, start_date, or end_date"
    });
  }

  try {
    const url =
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&start_date=${start_date}` +
      `&end_date=${end_date}` +
      `&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("Historic weather API error:", err);
    res.status(500).json({ error: "Failed to fetch historic weather" });
  }
};