// weather component: shows current weather for given coordinates

import { useEffect, useState } from "react";

export default function Weather({ latitude, longitude }) {
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [historic, setHistoric] = useState([]);

  // converting C to F (Celcius base)
  const convertTemp = (tempC) => (tempC * 9/5) + 32;

  // converting mm to in
  const convertPrecip = (mm) => mm / 25.4;

  // =======================
  // FUTURE FORECAST
  // =======================
  useEffect(() => {
    if (!latitude || !longitude) return;

    fetch(`http://localhost:53140/weather?latitude=${latitude}&longitude=${longitude}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then(data => {
        setCity(data.city.name);

        // group forecast entries by date
        const grouped = {};

        data.list.forEach(item => {
          const date = item.dt_txt.split(" ")[0];

        if (!grouped[date]) {
          grouped[date] = {
            date,
            tempMax: item.main.temp,
            tempMin: item.main.temp,
            icon: item.weather[0].icon,
            description: item.weather[0].description,
            precipitation: item.rain?.["3h"] || 0 // precipitation in last 3h
          };
        } else {
          // update max temp + icon/description if this temp is higher
          if (item.main.temp > grouped[date].tempMax) {
            grouped[date].tempMax = item.main.temp;
            grouped[date].icon = item.weather[0].icon;
            grouped[date].description = item.weather[0].description;
          }

          // update min temp
          if (item.main.temp < grouped[date].tempMin) {
            grouped[date].tempMin = item.main.temp;
          }

          // add precipitation
          grouped[date].precipitation += item.rain?.["3h"] || 0;
        }
      });

        // convert object to array (only first 5 days)
        const daily = Object.values(grouped).slice(0, 5);

        setForecast(daily);
      })
      .catch(err => setError(err.message));
  }, [latitude, longitude]);


  // =======================
  // HISTORICAL WEATHER
  // =======================
  useEffect(() => {
    if (!latitude || !longitude) return;

    // for the historical forecast, want the future forecast dates but just a year previous
    const firstDate = forecast[0].date;
    const lastDate = forecast[forecast.length - 1].date;

    const start = new Date(firstDate);
    const end = new Date(lastDate);

    // subtract one year
    start.setFullYear(start.getFullYear() - 1);
    end.setFullYear(end.getFullYear() - 1);

    const formatDate = (d) => d.toISOString().split("T")[0];

    fetch(
      `http://localhost:53140/weather/historic` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&start_date=${formatDate(start)}` +
      `&end_date=${formatDate(end)}`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch historic weather");
        return res.json();
      })
      .then(data => {
        setHistoric(
          data.daily.time.map((date, index) => ({
            date,
            tempMax: data.daily.temperature_2m_max[index],
            tempMin: data.daily.temperature_2m_min[index],
            precipitation: data.daily.precipitation_sum[index]
          }))
        );
      })
      .catch(err => setError(err.message));
  }, [forecast, latitude, longitude]);

  if (error) return <p>Error: {error}</p>;
  if (!forecast.length) return <p>Loading weather...</p>;

// =======================
// COMPONENTS
// =======================
return (
  <>      

    {/* ================= FUTURE FORECAST ================= */}
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h3>5-Day Future Forecast for {city}</h3>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}>
        {forecast.map(day => (
          <div key={day.date} style={{
            backgroundColor: '#7a8c99',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold' }}>{day.date}</p>

            <img
              src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
            />

            <p>⬆ {convertTemp(day.tempMax).toFixed(1)}°F</p>
            <p>⬇ {convertTemp(day.tempMin).toFixed(1)}°F</p>
            <p>☔ {convertPrecip(day.precipitation).toFixed(2)} in</p>

            <p style={{ color: '#555', fontStyle: 'italic', textTransform: 'capitalize' }}>
              {day.description}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* ================= HISTORICAL WEATHER ================= */}
    <h3 style={{ marginTop: "2rem", textAlign: "center" }}>
      5-Day Historical Forecast for {city}
    </h3>

    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }}>
      {historic.slice(0, 5).map(day => (
        <div key={day.date} style={{
          backgroundColor: '#cbd5db',
          padding: '1rem',
          borderRadius: '10px',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: 'bold' }}>{day.date}</p>

          <p>⬆ {convertTemp(day.tempMax).toFixed(1)}°F</p>
          <p>⬇ {convertTemp(day.tempMin).toFixed(1)}°F</p>
          <p>☔ {convertPrecip(day.precipitation).toFixed(2)} in</p>

        </div>
      ))}
    </div>
  </>
);
}