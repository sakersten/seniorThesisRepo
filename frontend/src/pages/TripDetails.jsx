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

  const [tripEditMode, setTripEditMode] = useState(false);
  const [tripEditForm, setTripEditForm] = useState({
    title: "",
    start_date: "",
    end_date: "",
    notes: ""
  });

  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState(false);

  const [editDestinationId, setEditDestinationId] = useState(null);
  const [editDestinationForm, setEditDestinationForm] = useState({
    destination_name: "",
    start_date: "",
    end_date: "",
    notes: ""
  });
  const [confirmDeleteDestinationId, setConfirmDeleteDestinationId] = useState(null);

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

  const handleEditTrip = async () => {
    try {
      const res = await fetch(`http://localhost:53140/trips/update-trip/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tripEditForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update trip");
      }

      const updatedTrip = await res.json();
      setTrip(updatedTrip);
      setTripEditMode(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      const res = await fetch(`http://localhost:53140/trips/${tripId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete trip");
      }

      navigate("/upcoming-trips");

    } catch (err) {
      console.error(err);
    }
  };

    const handleEditDestination = async (destinationId) => {
    try {
      const res = await fetch(`http://localhost:53140/destinations/update/${destinationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editDestinationForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update destination");
      }

      const updatedDestination = await res.json();

      // update destinations list in state
      setDestinations(latestState =>
        latestState.map(dest => dest.destination_id === destinationId ? { ...dest, ...updatedDestination } : dest)
      );

      setEditDestinationId(null);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    try {
      const res = await fetch(`http://localhost:53140/destinations/delete/${destinationId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete destination");
      }

      // remove destination from state
      setDestinations(latestState => latestState.filter(dest => dest.destination_id !== destinationId));
      setConfirmDeleteDestinationId(null);

    } catch (err) {
      console.error(err);
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
          {!tripEditMode ? (
            <>
              <h2 className="form-title">{trip.title}</h2>
              <p><strong>Start Date:</strong>{" "}{new Date(trip.start_date).toLocaleDateString()}</p>
              <p><strong>End Date:</strong>{" "}{new Date(trip.end_date).toLocaleDateString()}</p>
              <p><strong>Notes:</strong> {trip.notes || "None"}</p>

              <button onClick={() => {
                setTripEditMode(true);
                setTripEditForm({
                  title: trip.title,
                  start_date: trip.start_date.split("T")[0],
                  end_date: trip.end_date.split("T")[0],
                  notes: trip.notes ?? ""
                });
              }}>
                Edit Trip
              </button>

              {/* Delete Trip */}
              {!confirmDeleteTrip ? (
                <button onClick={() => setConfirmDeleteTrip(true)}>
                  Delete Trip
                </button>
              ) : (
                <div>
                  <p>Are you sure you want to delete this trip? This cannot be undone.</p>
                  <button onClick={handleDeleteTrip}>Yes, delete trip</button>
                  <button onClick={() => setConfirmDeleteTrip(false)}>Cancel</button>
                </div>
              )}
            </>
          ):(
            <>
              <h2 className="form-title">Edit Trip</h2>

              <div className="form-group">
                <label>Title</label>
                <input
                  value={tripEditForm.title}
                  onChange={event => setTripEditForm({ ...tripEditForm, title: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={tripEditForm.start_date}
                  onChange={event => setTripEditForm({ ...tripEditForm, start_date: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={tripEditForm.end_date}
                  onChange={event => setTripEditForm({ ...tripEditForm, end_date: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input
                  value={tripEditForm.notes}
                  onChange={event => setTripEditForm({ ...tripEditForm, notes: event.target.value })}
                />
              </div>

              <button onClick={handleEditTrip}>Save Changes</button>
              <button onClick={() => setTripEditMode(false)}>Cancel</button>
          </>
        )}
      </div>

        {/* Destinations */}
        <div className="form-box">
          <h3>Destinations</h3>

          {destinations.length === 0 ? (
            <p>No destinations added yet.</p>
          ) : (
            destinations.map((dest, index) => (
              <div key={dest.destination_id} className="form-group">
                {editDestinationId === dest.destination_id ? (
                  <>
                    <h4>Edit Destination</h4>


                    <div className="form-group">
                      <label>Name</label>
                      <input
                        value={editDestinationForm.destination_name}
                        onChange={event => setEditDestinationForm({ ...editDestinationForm, destination_name: event.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={editDestinationForm.start_date}
                        min={trip.start_date.split("T")[0]}
                        max={trip.end_date.split("T")[0]}
                        onChange={event => setEditDestinationForm({ ...editDestinationForm, start_date: event.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={editDestinationForm.end_date}    
                        min={editDestinationForm.start_date || trip.start_date.split("T")[0]}
                        max={trip.end_date.split("T")[0]}
                        onChange={event => setEditDestinationForm({ ...editDestinationForm, end_date: event.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <input
                        value={editDestinationForm.notes}
                        onChange={event => setEditDestinationForm({ ...editDestinationForm, notes: event.target.value })}
                      />
                    </div>

                    <button onClick={() => handleEditDestination(dest.destination_id)}>
                      Save Changes
                    </button>
                    <button onClick={() => setEditDestinationId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
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

                    <button onClick={() => {
                      setEditDestinationId(dest.destination_id);
                      setEditDestinationForm({
                        destination_name: dest.destination_name,
                        start_date: dest.start_date.split("T")[0],
                        end_date: dest.end_date.split("T")[0],
                        notes: dest.notes ?? ""
                      });
                    }}>
                      Edit Destination
                    </button>

                    {confirmDeleteDestinationId === dest.destination_id ? (
                      <div>
                        <p>Are you sure you want to delete this destination? This cannot be undone.</p>
                        <button onClick={() => handleDeleteDestination(dest.destination_id)}>
                          Yes, delete destination
                        </button>
                        <button onClick={() => setConfirmDeleteDestinationId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteDestinationId(dest.destination_id)}>
                        Delete Destination
                      </button>
                    )}
                  </>
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
                    <th>Formality</th>
                    <th>Color</th>
                    <th>Material</th>
                    <th>Warmth Level</th>
                    <th>Waterproof</th>
                    <th>Layerable</th>
                  </tr>
                </thead>
                <tbody>
                  {packingList.recommended.map(item => (
                    <tr key={item.item_id ?? item.pack_item_id}>
                      <td>{item.item_subcategory ?? item.subcategory}</td>
                      <td>{item.item_category ?? item.category}</td>
                      <td>{item.formality ?? "N/A"}</td>
                      <td>{item.color ?? "N/A"}</td>
                      <td>{item.material ?? "N/A"}</td>
                      <td>{item.warmth_level ?? "N/A"}</td>
                      <td>{item.is_waterproof ? "Yes" : "No"}</td>
                      <td>{item.is_layerable ? "Yes" : "No"}</td>
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