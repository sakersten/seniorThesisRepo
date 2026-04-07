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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Login with Google</h2>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login failed")}
      />
    </div>
  );
}

export default Login;