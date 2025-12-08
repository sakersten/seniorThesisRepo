import React from "react";
import { GoogleLogin } from "@react-oauth/google";

function Login({ onLogin }) {
  const handleGoogleLogin = (credentialResponse) => {
    const token = credentialResponse.credential;

    // decode the JWT token returned by Google to get user info
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // pass user info back to App
    onLogin({ name: payload.name, email: payload.email });
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