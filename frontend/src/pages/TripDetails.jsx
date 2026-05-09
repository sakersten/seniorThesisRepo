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

  const handleTogglePacked = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:53140/packing/items/${itemId}/toggle`, {
        method: "PATCH",
        credentials: "include"
      });

      const data = await res.json();
      console.log("toggle response:", data);

      setPackingList(latestState => ({
        ...latestState,
        recommended: latestState.recommended.map(item =>
          item.pack_item_id === itemId
            ? { ...item, is_checked: !item.is_checked }
            : item
        )
      }));

    } catch (err) {
      console.error(err);
    }
  };

  if (!trip) {
    return <div className="page-container">Trip Not Found...</div>;
  }

return (
  <div className="page-container">

    <button className="back-button" onClick={() => navigate("/upcoming-trips")}>
      ← Back to Upcoming Trips
    </button>
    
    {/* TO-DO: eventually add weather widgets - show weather for the duration you are at each destination */}

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px", alignItems: "start" }}>

      {/* LEFT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* Trip Info */}
        <div className="form-box">
          {!tripEditMode ? (
            <>
              <h2 className="form-title">{trip.title}</h2>
              <p><strong>Start Date:</strong>{" "}{new Date(trip.start_date).toLocaleDateString()}</p>
              <p><strong>End Date:</strong>{" "}{new Date(trip.end_date).toLocaleDateString()}</p>
              <p><strong>Notes:</strong> {trip.notes || "None"}</p>
              <div className="btn-row">
                <button className="btn-secondary" onClick={() => {
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
                {!confirmDeleteTrip ? (
                  <button className="btn-danger" onClick={() => setConfirmDeleteTrip(true)}>
                    Delete Trip
                  </button>
                ) : (
                  <>
                    <button className="btn-danger" onClick={handleDeleteTrip}>Yes, delete</button>
                    <button className="btn-secondary" onClick={() => setConfirmDeleteTrip(false)}>Cancel</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="form-title">Edit Trip</h2>
              <div className="form-group">
                <label>Title</label>
                <input value={tripEditForm.title} onChange={event => setTripEditForm({ ...tripEditForm, title: event.target.value })} />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={tripEditForm.start_date} onChange={event => setTripEditForm({ ...tripEditForm, start_date: event.target.value })} />
              </div>
              
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={tripEditForm.end_date} onChange={event => setTripEditForm({ ...tripEditForm, end_date: event.target.value })} />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input value={tripEditForm.notes} onChange={event => setTripEditForm({ ...tripEditForm, notes: event.target.value })} />
              </div>

              <div className="btn-row">
                <button className="btn-success" onClick={handleEditTrip}>Save Changes</button>
                <button className="btn-secondary" onClick={() => setTripEditMode(false)}>Cancel</button>
              </div>
            </>
          )}
        </div>

        {/* Destinations */}
        <div className="form-box">
          <div className="section-header">
            <h3>Destinations</h3>
            <button className="btn-primary" style={{ marginTop: "0.5rem" }} onClick={() => navigate(`/trips/${tripId}/add-destination`)}>
              + Add Destination
            </button>
          </div>

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
                      <input value={editDestinationForm.destination_name} onChange={event => setEditDestinationForm({ ...editDestinationForm, destination_name: event.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" value={editDestinationForm.start_date} min={trip.start_date.split("T")[0]} max={trip.end_date.split("T")[0]} onChange={event => setEditDestinationForm({ ...editDestinationForm, start_date: event.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" value={editDestinationForm.end_date} min={editDestinationForm.start_date || trip.start_date.split("T")[0]} max={trip.end_date.split("T")[0]} onChange={event => setEditDestinationForm({ ...editDestinationForm, end_date: event.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <input value={editDestinationForm.notes} onChange={event => setEditDestinationForm({ ...editDestinationForm, notes: event.target.value })} />
                    </div>

                    <div className="btn-row">
                      <button className="btn-success" onClick={() => handleEditDestination(dest.destination_id)}>Save Changes</button>
                      <button className="btn-secondary" onClick={() => setEditDestinationId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>{index + 1}. {dest.destination_name}</strong></p>
                    <p>{new Date(dest.start_date).toLocaleDateString()}{" → "}{new Date(dest.end_date).toLocaleDateString()}</p>
                    <p><strong>Notes:</strong>{" "}{dest.notes && dest.notes.trim().length > 0 ? dest.notes : "No notes"}</p>
                    <p><strong>Activities:</strong></p>
                    {destinationActivities[dest.destination_id]?.length > 0 ? (
                      <p>{destinationActivities[dest.destination_id].map(act => act.name).join(", ")}</p>
                    ) : (
                      <p>No activities</p>
                    )}
                    <div className="btn-row">
                      <button className="btn-secondary" onClick={() => {
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
                        <>
                          <button className="btn-danger" onClick={() => handleDeleteDestination(dest.destination_id)}>Yes, delete</button>
                          <button className="btn-secondary" onClick={() => setConfirmDeleteDestinationId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn-danger" onClick={() => setConfirmDeleteDestinationId(dest.destination_id)}>
                          Delete Destination
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* END LEFT COLUMN */}

      {/* RIGHT COLUMN */}
      <div className="form-box">
        <div className="section-header" style={{ marginBottom: "1rem" }}>
          <h3>Packing List</h3>
          <button className="btn-primary" style={{ marginTop: "0.5rem" }} onClick={handleGeneratePackingList} disabled={packingLoading}>
            {packingLoading ? "Generating..." : packingList ? "Regenerate Packing List" : "Generate Packing List"}
          </button>
        </div>

        {packingError && <p>{packingError}</p>}

        {!packingList && (
          <p>No packing list generated yet. Click Generate to get started.</p>
        )}

        {packingList && (
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Formality</th>
                <th>Color</th>
                <th>Material</th>
                <th>Warmth</th>
                <th>Waterproof</th>
                <th>Layerable</th>
                <th>Packed</th>
              </tr>
            </thead>
            <tbody>
              {packingList.recommended.map(item => (
                <tr
                  key={item.item_id ?? item.pack_item_id}
                  style={{ opacity: item.is_checked ? 0.4 : 1, transition: "opacity 0.2s" }}
                >
                  <td>{item.item_subcategory ?? item.subcategory}</td>
                  <td>{item.item_category ?? item.category}</td>
                  <td>{item.formality ?? "N/A"}</td>
                  <td>{item.color ?? "N/A"}</td>
                  <td>{item.material ?? "N/A"}</td>
                  <td>{item.warmth_level ?? "N/A"}</td>
                  <td>{item.is_waterproof ? "Yes" : "No"}</td>
                  <td>{item.is_layerable ? "Yes" : "No"}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.is_checked ?? false}
                      disabled={!item.pack_item_id}
                      onChange={() => handleTogglePacked(item.pack_item_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* END RIGHT COLUMN */}

    </div>
    {/* END TWO COLUMN */}

  </div>
);
}

export default TripDetails;

/*  /* Weather Section */
    /*<div style={{ marginTop: "2rem" }}>
      <Weather latitude={latitude} longitude={longitude} />
    </div>
  </div>*/