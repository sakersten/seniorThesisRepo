import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, BrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import NewTrip from "./pages/NewTrip.jsx"; 
import UpcomingTrips from "./pages/UpcomingTrips.jsx"; 
import Closet from "./pages/Closet.jsx"; 

function App() {
  const [user, setUser] = useState(null); // store logged-in user info

  // Check if user is logged in when app loads
  useEffect(() => {
    fetch("http://localhost:53140/auth/am-i-loggedin", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser({ name: data.username }); // set user if logged in
        }
      })
      .catch((err) => console.error("Error checking login:", err));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:53140/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Routes>
      {/* Login page: redirect to home if already logged in */}
      {/* Login page: if already logged in, redirect to Home */}
      <Route
        path="/login"
        element={user ? <Navigate to="/home" /> : <Login onLogin={setUser} />}
      />

      {/* Home page: main landing page after login; requires user */}
      <Route
        path="/home"
        element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />

      {/* New Trip page: form to create a new trip; requires user */}
      <Route
        path="/newtrip"
        element={user ? <NewTrip /> : <Navigate to="/login" />}
      />

      {/* Upcoming Trips page: view all upcoming trips; requires user */}
      <Route
        path="/upcomingtrips"
        element={user ? <UpcomingTrips /> : <Navigate to="/login" />}
      />

      {/* Closet page: view closet items; requires user */}
      <Route
        path="/closet"
        element={user ? <Closet /> : <Navigate to="/login" />}
      />

      {/* Catch-all route: redirect unknown URLs depending on login status */}  
      <Route
        path="*"
        element={<Navigate to={user ? "/home" : "/login"} />}
      />
    </Routes>
  );
}

export default App;