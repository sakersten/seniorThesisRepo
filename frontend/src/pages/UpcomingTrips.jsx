import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function UpcomingTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]); 

  // fetch trips on page load
  useEffect(() => {
    fetch("http://localhost:53140/trips/upcoming-trips", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      <h1>Upcoming Trips</h1>

      {/* TO-DO: make more aesthetic */}
      
      {/* add column to view a packing list for specific trip */}
      {trips.length === 0 ? (
        <p>No upcoming trips yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.trip_id}>
                <td>{trip.title}</td>
                <td>{new Date(trip.start_date).toLocaleDateString()}</td>
                <td>{new Date(trip.end_date).toLocaleDateString()}</td>

                <td>
                  <button
                    className="form-button"
                    onClick={() => navigate(`/trips/${trip.trip_id}`)}
                  >
                    View/Edit Trip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UpcomingTrips;