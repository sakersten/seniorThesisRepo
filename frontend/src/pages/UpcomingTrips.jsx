      
import { useNavigate } from "react-router-dom";

function UpcomingTrips() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      <h1>Upcoming Trips</h1>
    </div>
  );
}

export default UpcomingTrips;

  {/* Weather Section */}
    /*<div style={{ marginTop: "2rem" }}>
      <Weather latitude={latitude} longitude={longitude} />
    </div>
  </div>*/
  