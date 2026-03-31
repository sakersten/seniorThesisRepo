import { useNavigate } from "react-router-dom";

function NewTrip() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      <h1>New Trip</h1>
    </div>
  );
}

export default NewTrip;