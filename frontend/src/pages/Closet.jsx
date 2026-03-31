import { useNavigate } from "react-router-dom";

function Closet() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      <h1>Closet</h1>
    </div>
  );
}

export default Closet;