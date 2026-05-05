// handles API calls and normalization for forecast AND historical weather
// produces structured daily weather objects and derives packing-relevant weather tags

import dotenv from 'dotenv'; 
dotenv.config(); 

// gets the future forecast weather; returns raw 5-day / 3-hour forecast data
export const fetchForecastWeather  = async (latitude, longitude) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  try {
    const url = 
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`; 
    const response = await fetch(url);
    const data = await response.json();
    return data; 

  } catch (err) {
    console.error("Forecast weather API error:", err);
    throw err; 
  }
};

// gets the historical weather; returns daily aggregated historical weather data
export const fetchHistoricWeather = async (latitude, longitude, startDate, endDate) => {
    try {
    const url =
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&start_date=${startDate}` +
      `&end_date=${endDate}` +
      `&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();
    return data; 

  } catch (err) {
    console.error("Historic weather API error:", err);
    throw err; 
  }
};

// builds weather for a trip destination 
// 1. builds the trip date range
// 2. fetches forecast + historical data
// 3. normalizes both datasets
// 4. matches weather per day (forecast first, fallback to historical)
export const getWeatherForDestination = async (destination) => {
  const {
    latitude,
    longitude,
    start_date: startDate,
    end_date: endDate
  } = destination;

  try {
    const tripDays = buildDateRange(startDate, endDate);

    const forecastData = await fetchForecastWeather(latitude, longitude);
    const historicalData = await fetchHistoricWeather(
      latitude,
      longitude,
      shiftYear(startDate, -1),
      shiftYear(endDate, -1)
    );

    const forecastByDay = indexByDate(normalizeForecastWeather(forecastData));
    const historicalByDay = indexByDate(normalizeHistoricalWeather(historicalData));

    const dailyWeather = tripDays.map((date) => {
        const forecast = forecastByDay[date];
        const historicalDate = shiftYear(date, -1);
        const historical = historicalByDay[historicalDate];

        const weatherData = forecast || historical;

        if (!weatherData) {
            return {
            date,
            source: "missing",
            avgTemp: null,
            low: null,
            high: null,
            precipitationChance: 0
            };
        }

        return {
            date,
            source: forecast ? "forecast" : "historical",
            ...weatherData
        };
    });

    return {
      latitude,
      longitude,
      startDate,
      endDate,
      dailyWeather
    };

  } catch (error) {
    console.error("getWeatherForDestination error:", error);
    throw error;
  }
};

// normalize forecast weather (3-hour chunks -> daily summary); returns one entry per day with aggregated values
export const normalizeForecastWeather = (forecastData) => {
  try {
    const dailyMap = {};

    for (const entry of forecastData.list) {
      const date = entry.dt_txt.split(" ")[0]; // YYYY-MM-DD

      if (!dailyMap[date]) {
        dailyMap[date] = {
          temperatures: [],
          minTemps: [],
          maxTemps: [],
          rainCount: 0,
          totalCount: 0
        };
      }

      const day = dailyMap[date];

      const temperature = entry.main.temp;
      const minTemperature = entry.main.temp_min;
      const maxTemperature = entry.main.temp_max;

      day.temperatures.push(temperature);
      day.minTemps.push(minTemperature);
      day.maxTemps.push(maxTemperature);
      day.totalCount++;

      if (entry.weather?.[0]?.main?.toLowerCase().includes("rain")) {
        day.rainCount++;
      }
    }

    return Object.entries(dailyMap).map(([date, day]) => {
      return {
        date,
        avgTemp: calculateAverage(day.temperatures),
        low: Math.min(...day.minTemps),
        high: Math.max(...day.maxTemps),
        precipitationChance:
          (day.rainCount / day.totalCount) * 100
      };
    });
  } catch (error) {
    console.error("normalizeForecastByDay error:", error);
    throw error;
  }
};

// normalize historical weather (data is already aggregated); returns structured daily objects
export const normalizeHistoricalWeather = (historicalData) => {
  try {
    if (!historicalData?.daily?.time) {
      console.error("Invalid historical data:", historicalData);
      return [];
    }

    const daily = historicalData.daily;

    return daily.time.map((date, index) => {    
      return {
        date,
        avgTemp: daily.temperature_2m_mean[index],
        high: daily.temperature_2m_max[index],
        low: daily.temperature_2m_min[index],
        precipitationChance: Math.min(daily.precipitation_sum[index] * 10, 100)
      };
    });
  } catch (error) {
    console.error("normalizeHistoricalWeather error:", error);
    throw error;
  }
};

// create weather tags based on retrieved weather
export const getWeatherTags = ({ avgTemp, precipitationChance }) => {
  const tags = [];

  if (avgTemp == null) return ["unknown"];

  // temperature tags (Celsius for backend logic, but will display as Fahrenheit in the frontend)
  if (avgTemp <= 32) tags.push("very_cold"); // very_cold = below 0°C / 32°F
  else if (avgTemp <= 54) tags.push("cold"); // cold = 1-12°C / ~33-54°F
  else if (avgTemp <= 69) tags.push("mild"); // mild = 13-20°C / ~55-69°F
  else if (avgTemp <= 80) tags.push("warm"); // warm = 21-27° / ~70-80°F
  else tags.push("hot");                   // hot = above 28°C / ~81°F

  // precipitation tag
  if (precipitationChance >= 40) {
    tags.push("rainy");
  } else if (precipitationChance >= 15) {
    tags.push("slightly_rainy");
  } else {
    tags.push("dry");
  }

  return tags;
};

// ============================================
// HELPER METHODS
// ============================================
// build list of dates between the start and end date (inclusive)
const buildDateRange = (startDate, endDate) => {
  const dates = [];

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]); // YYYY-MM-DD
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// shift the year back to the prior year -> used to compare future trip dates to historical year
const shiftYear = (dateString, yearOffset) => {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + yearOffset);

  return date.toISOString().split("T")[0];
};

// compute average of numeric array
const calculateAverage = (numbers) =>
  numbers.reduce((sum, value) => sum + value, 0) / numbers.length;

// convert array of daily objects into lookup map: { "2026-05-10": { ...weather } }
const indexByDate = (dailyArray) => {
  const map = {};

  for (const day of dailyArray) {
    map[day.date] = day;
  }

  return map;
};

export default {
  fetchForecastWeather,
  fetchHistoricWeather,
  getWeatherForDestination,
  normalizeForecastWeather,
  normalizeHistoricalWeather, 
  getWeatherTags
};