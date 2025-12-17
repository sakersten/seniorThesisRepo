// weather component: shows current weather for given coordinates

import { useEffect, useState } from "react";

export default function Weather({ latitude, longitude }) {
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [historic, setHistoric] = useState([]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    fetch(`http://localhost:53140/weather?latitude=${latitude}&longitude=${longitude}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then(data => {
        setCity(data.city.name);
        // pick 12:00:00 entries for daily forecast
        const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
        setForecast(daily);
      })
      .catch(err => setError(err.message));
  }, [latitude, longitude]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    fetch(
      `http://localhost:53140/weather/historic` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&start_date=2024-01-01` +
      `&end_date=2024-01-07`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch historic weather");
        return res.json();
      })
      .then(data => {
        setHistoric(
          data.daily.time.map((date, index) => ({
            date,
            tempMean: data.daily.temperature_2m_mean[index],
            tempMax: data.daily.temperature_2m_max[index],
            tempMin: data.daily.temperature_2m_min[index],
            precipitation: data.daily.precipitation_sum[index]
          }))
        );
      })
      .catch(err => setError(err.message));
  }, [latitude, longitude]);

  if (error) return <p>Error: {error}</p>;
  if (!forecast.length) return <p>Loading weather...</p>;

return (
  <>
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h3>5-Day Forecast for {city}</h3>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}>
        {forecast.map(item => (
          <div key={item.dt} style={{
            backgroundColor: '#7a8c99',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold' }}>{item.dt_txt.split(" ")[0]}</p>
            <img
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              alt={item.weather[0].description}
            />
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {item.main.temp.toFixed(1)}°C
            </p>
            <p style={{ color: '#555', fontStyle: 'italic', textTransform: 'capitalize' }}>
              {item.weather[0].description}
            </p>
          </div>
        ))}
      </div>
    </div>

    <h3 style={{ marginTop: "2rem", textAlign: "center" }}>
      Typical Weather (Historical)
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
          <p>⬆ {day.tempMax.toFixed(1)}°C</p>
          <p>⬇ {day.tempMin.toFixed(1)}°C</p>
          <p>☔ {day.precipitation} mm</p>
        </div>
      ))}
    </div>
  </>
);
}