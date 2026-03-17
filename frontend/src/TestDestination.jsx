import { useState } from "react";

export default function CityDropdown() {
  const [cityInput, setCityInput] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const searchCity = async () => {
    if (!cityInput) return;

    try {
      const res = await fetch(
        `http://localhost:53140/destinations/search?city=${encodeURIComponent(cityInput)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setResults([]);
    }
  };

  const handleSelect = (city) => {
    setSelectedCity(city);
    // Optional: clear search results after selecting
    setResults([]);
    setCityInput(
      `${city.city}${city.state ? ", " + city.state : ""}, ${city.country}`
    );
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Search Destination</h2>

      <input
        type="text"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        placeholder="Enter city name"
        style={{ padding: "0.5rem", width: "250px", marginRight: "0.5rem" }}
      />
      <button onClick={searchCity} style={{ padding: "0.5rem 1rem" }}>
        Search
      </button>

      {/* Dropdown list of results */}
      {results.length > 0 && (
        <ul
          style={{
            marginTop: "0.5rem",
            listStyleType: "none",
            padding: 0,
            border: "1px solid #ddd",
            maxWidth: "300px",
            borderRadius: "4px",
          }}
        >
          {results.map((r, index) => (
            <li
              key={index}
              onClick={() => handleSelect(r)}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                borderBottom:
                  index < results.length - 1 ? "1px solid #ddd" : "none",
              }}
            >
              <strong>{r.city}</strong>
              {r.state ? `, ${r.state}` : ""}, {r.country} <br />
              Lat: {r.latitude.toFixed(4)}, Lon: {r.longitude.toFixed(4)}
            </li>
          ))}
        </ul>
      )}

      {/* Display the selected city */}
      {selectedCity && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Selected City:</h3>
          <p>
            {selectedCity.city}
            {selectedCity.state ? `, ${selectedCity.state}` : ""},{" "}
            {selectedCity.country} <br />
            Latitude: {selectedCity.latitude.toFixed(4)}, Longitude:{" "}
            {selectedCity.longitude.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}