import { useState } from "react";
import { useEffect } from "react"; 
import { useNavigate } from "react-router-dom";

function NewTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  // fetch countries on load
  useEffect(() => {
    fetch("http://localhost:53140/destinations/countries")
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error(err));
  }, []);

  // update trip form fields
  const handleChange = (event) => {
    setFormData(latestState => ({ ...latestState, [event.target.name]: event.target.value }));
  };

  // validates the form inputs
  const validateForm = () => {
    const errors = [];

    // trip title required
    if (!formData.title.trim()) errors.push("Trip title is required");

    // start/end dates required
    if (!formData.start_date) errors.push("Trip start date is required");
    if (!formData.end_date) errors.push("Trip end date is required");
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push("Start date cannot be after end date");
    }

    return errors;
  };

  // submit the trip and destinations
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n")); // or setErrors(errors) for inline display
      return; // stop here
    }

    try {
      // create the trip
      const tripRes = await fetch("http://localhost:53140/trips/new-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

        if (!tripRes.ok) {
        // trip creation failed on backend
        const errData = await tripRes.json();
        alert("Failed to create trip: " + (errData.error || tripRes.statusText));
        return; // stop here
      }

      navigate("/upcoming-trips");

    } catch (err) {
      console.error("Error creating trip:", err);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/home")}>← Cancel</button>

      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">New Trip</h2>

          {/* Trip Title */}
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Trip Start Date */}
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Trip End Date */}
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Trip Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="button" className="form-button" onClick={handleSubmit}>
          Create Trip
        </button>
      </div>
    </div>
  );
}

export default NewTrip;