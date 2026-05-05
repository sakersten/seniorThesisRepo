import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [destinationActivities, setDestinationActivities] = useState({});

  const [packingList, setPackingList] = useState(null);
  const [packingLoading, setPackingLoading] = useState(false);
  const [packingError, setPackingError] = useState(null);


  // fetch trip + destinations + existing packing list
  useEffect(() => {
    // get trip details
    fetch(`http://localhost:53140/trips/${tripId}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setTrip(data))
      .catch(err => console.error(err));

    // get destinations
    fetch(`http://localhost:53140/destinations/trip/${tripId}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setDestinations(data))
      .catch(err => console.error(err));    
    
    // load existing packing list if one was already generated
    fetch(`http://localhost:53140/packing/${tripId}`, {
      credentials: "include"
    })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data) {
          setPackingList({
            recommended: data.items,
            notRecommended: [],
            conditions: data.conditions,
          });
        }
      })
      .catch(err => console.error(err));
  }, [tripId]);

  // fetch activities for each destination
  useEffect(() => {
    if (destinations.length === 0) return;

    destinations.forEach((destination) => {
      fetch(`http://localhost:53140/destination-activities/destination/${destination.destination_id}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setDestinationActivities(latestState => ({
            ...latestState,
            [destination.destination_id]: data
          }));
        })
        .catch(err => console.error(err));
    });
  }, [destinations]);

  const handleGeneratePackingList = async () => {
    try {
      setPackingLoading(true);
      setPackingError(null);

      const res = await fetch(`http://localhost:53140/packing/generate/${tripId}`, {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate packing list");
      }

      const data = await res.json();
      setPackingList(data);

    } catch (err) {
      console.error(err);
      setPackingError(err.message);
    } finally {
      setPackingLoading(false);
    }
  };

  if (!trip) {
    return <div className="page-container">Trip Not Found...</div>;
  }

  return (
    <div className="page-container">
      
      {/* TO-DO: make more aesthetic -> adjust font sizes? */}
      {/* TO-DO: implement weather functionality (pull upcoming/historical weather for a given destination by dates, long, lat);
                 pull the weather and put it next to/under the destination name/details */}
      {/* TO-DO: implement "update trip" functionality */}
      {/* TO-DO: implement "delete trip" functionality */}
      
      {/* Back button */}
      <button className="back-button" onClick={() => navigate("/upcoming-trips")}>
        ← Back to Upcoming Trips
      </button>

      {/* Trip Info */}
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">{trip.title}</h2>
          <p><strong>Start Date:</strong>{" "}{new Date(trip.start_date).toLocaleDateString()}</p>
          <p><strong>End Date:</strong>{" "}{new Date(trip.end_date).toLocaleDateString()}</p>
          <p><strong>Notes:</strong> {trip.notes || "None"}</p>
        </div>

        {/* Destinations */}
        <div className="form-box">
          <h3>Destinations</h3>

          {destinations.length === 0 ? (
            <p>No destinations added yet.</p>
          ) : (
            destinations.map((dest, index) => (
              <div key={dest.destination_id} className="form-group">
                <p><strong>{index + 1}. {dest.destination_name}</strong></p>
                <p>
                    {new Date(dest.start_date).toLocaleDateString()}{" → "}
                    {new Date(dest.end_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Trip Notes:</strong>{" "}
                  {dest.notes && dest.notes.trim().length > 0 ? dest.notes : "No notes"}
                </p>

                <p><strong>Trip Activities:</strong></p>
                {destinationActivities[dest.destination_id]?.length > 0 ? (
                  <p>
                    {destinationActivities[dest.destination_id]
                      .map(act => act.name)
                      .join(", ")}
                  </p>
                ) : (
                  <p>No activities</p>
                )}
              </div>
            ))
          )}
          
          {/* TO-DO: Add weather for each destination next to it */}

          {/* Add destination button */}
          <button
            className="form-button"
            onClick={() => navigate(`/trips/${tripId}/add-destination`)}
          >
            + Add Destination
          </button>

          {/* Packing List */}
          <button onClick={handleGeneratePackingList} disabled={packingLoading}>
            {packingLoading ? "Generating..." : packingList ? "Regenerate Packing List" : "Generate Packing List"}
          </button>

          {packingError && <p>{packingError}</p>}

          {packingList && (
            <div>
              <h4>Recommended</h4>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Color</th>
                    <th>Material</th>
                    <th>Warmth Level</th>
                    <th>Waterproof</th>
                    <th>Layerable</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {packingList.recommended.map(item => (
                    <tr key={item.item_id ?? item.pack_item_id}>
                      <td>{item.item_subcategory ?? item.subcategory}</td>
                      <td>{item.item_category ?? item.category}</td>
                      <td>{item.color ?? "N/A"}</td>
                      <td>{item.material ?? "N/A"}</td>
                      <td>{item.warmth_level ?? "N/A"}</td>
                      <td>{item.is_waterproof ? "Yes" : "No"}</td>
                      <td>{item.is_layerable ? "Yes" : "No"}</td>
                      <td>{item.suggestedQuantity ?? item.quantity_recommended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetails;

  {/* Weather Section */}
    /*<div style={{ marginTop: "2rem" }}>
      <Weather latitude={latitude} longitude={longitude} />
    </div>
  </div>*/