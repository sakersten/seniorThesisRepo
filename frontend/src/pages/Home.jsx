import React from "react";
import { NavLink } from "react-router-dom";

function Home({ user, onLogout }) {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user.name}!</h2>

      <button onClick={onLogout} style={{ marginBottom: "1rem" }}>
        Logout
      </button>

      <div className="nav-container">
        <NavLink to="/newtrip" className="nav-button">
          New Trip
        </NavLink>

        <NavLink to="/upcomingtrips" className="nav-button">
          Upcoming Trips
        </NavLink>

        <NavLink to="/closet" className="nav-button">
          View Closet
        </NavLink>
      </div>
    </div>
  );
}

export default Home;