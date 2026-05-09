import React from "react";
import { useNavigate } from "react-router-dom";

function Home({ user, onLogout }) {
  const navigate = useNavigate(); 

  const cards = [
    {
      icon: "fa-plane-departure",
      title: "New Trip",
      description: "Plan a new upcoming trip.",
      path: "/new-trip",
      action: "Get Started"
    },
    {
      icon: "fa-calendar-days",
      title: "Upcoming Trips",
      description: "View and manage your planned trips and packing lists.",
      path: "/upcoming-trips",
      action: "View Trips"
    },
    {
      icon: "fa-shirt",
      title: "My Closet",
      description: "Manage your clothing items for smarter packing recommendations.",
      path: "/closet",
      action: "View Closet"
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {user.name}!</h2>
        <button className="btn-danger" onClick={onLogout} style={{ marginBottom: "1rem" }}>
          Logout
        </button>
      </div>

      {/* Card Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
        marginTop: "1rem"
      }}>
        {cards.map((card) => (
          <div
            key={card.title}
            className="form-box"
            style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", alignItems: "center", textAlign: "center" }}
            onClick={() => navigate(card.path)}
            onMouseEnter={event => {
              event.currentTarget.style.transform = "translateY(-1.5px)";
              event.currentTarget.style.boxShadow = "0 6px 20px rgba(74, 111, 165, 0.15)";
            }}
            onMouseLeave={event => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow = "";
            }}
          >            
            <i
              className={`fa-solid ${card.icon}`}
              style={{ fontSize: "1.75rem", color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}
            />
            <h3 style={{ marginBottom: "0.4rem" }}>{card.title}</h3>
            <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>{card.description}</p>
            <button
              className="btn-primary"
              style={{ width: "fit-content" }}
              onClick={(event) => { event.stopPropagation(); navigate(card.path); }}
            >
              {card.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;