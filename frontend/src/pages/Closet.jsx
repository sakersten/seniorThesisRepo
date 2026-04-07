import { NavLink, useNavigate } from "react-router-dom";

function Closet() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Closet Items</h1>

      <button onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      {/* Link to add new item */}
      <NavLink to="/closet/new" style={{ marginBottom: "1rem", display: "inline-block" }}>
        + Add New Item
      </NavLink>
    </div>
  );
}

export default Closet;