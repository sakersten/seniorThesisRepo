import React from "react";
import { GoogleLogin } from "@react-oauth/google";

function Login({ onLogin }) {
  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await fetch("http://localhost:53140/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user); 
      } else {
        console.error("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      {/* Web App Name */}
      <div style={{ textAlign: "center"}}>
        <h1>PackPal</h1>
        <p>Your smart travel packing assistant!</p>
      </div>

      <div className="form-box" style={{ width: "100%", maxWidth: "360px", alignItems: "center", textAlign: "center" }}>
        <h2>Welcome!</h2>
        <p style={{ marginBottom: "1.5rem", fontSize: "0.875rem" }}>Sign in to manage your trips and packing lists.</p>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.log("Login failed")}
        />
      </div>
    </div>
  );
}

export default Login;