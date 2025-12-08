import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

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
      <Route
        path="/login"
        element={user ? <Navigate to="/home" /> : <Login onLogin={setUser} />}
      />

      {/* Home page: redirect to login if not logged in */}
      <Route
        path="/home"
        element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />

      {/* Default route: redirect depending on login status */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
    </Routes>
  );
}

export default App;