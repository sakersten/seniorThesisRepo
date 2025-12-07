import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // store logged-in user info

  // check login status on load
  const checkLoginStatus = () => {
    fetch('http://localhost:53140/am-i-loggedin', { 
        credentials: 'include', // send cookies/session id
      })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          //setUsername(data.username); // set username if logged in
          //fetchAssignments();         // fetch assignments if logged in
          //fetchClasses();             // fetch classes if logged in 
        } else {
          // clear state if somehow still logged in on frontend
          //setUsername('');
          //setAssignments([]);
          //setClasses([]);
        }
      })
    .catch(err => console.error('Error checking login:', err));
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // handles login functionality
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

    // set user state with Google info
    setUser({ name: payload.name, email: payload.email });
  };

  // handles logout functionality
const handleLogout = async () => {
  try {
    const res = await fetch('http://localhost:53140/logout', { 
      method: 'POST',
      credentials: 'include', // important to include cookies
    });

    if (res.ok) {
      setUser(null); // reset user state
      console.log('Logged out successfully');
    } else {
      console.error('Logout failed');
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// adjust for project functionality later on
//   const completeLogout = () => {
//     setUsername('');
//     setLoginUsername('');
//     setLoginPassword('');
//     setRegisterUsername('');
//     setRegisterPassword('');   
//     setAssignments([]);
//     setClasses([]);
//   };

// add async functions here...


  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? (
        <div>
          <h2>Login with Google</h2>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("Login failed")}
          />
        </div>
      ) : (
        <div>
            <h2>Welcome, {user.name}!</h2>
            <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
}

export default App;