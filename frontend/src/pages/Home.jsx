import React from "react";
import { NavLink } from "react-router-dom"; // will use when i want to navigate to other pages... keep for now
import Weather from "../components/Weather";

// create a nice wrapper at the top for each page... maybe?

function Home({ user, onLogout }) {
  // example coordinates for testing (Paris)
  const latitude = 48.8566;
  const longitude = 2.3522;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user.name}!</h2>
      <button onClick={onLogout} style={{ marginBottom: "1rem" }}>
        Log out
      </button>

      {/* Weather Section */}
      <div style={{ marginTop: "2rem" }}>
        <Weather latitude={latitude} longitude={longitude} />
      </div>
    </div>
  );
}

export default Home;