import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function NewDestinations() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [destinations, setDestinations] = useState([
    { country_id: "", state_id: "", city_id: "", start_date: "", end_date: "", notes: "", activity_ids: [] }
  ]);

  const [countries, setCountries] = useState([]);
  const [statesMap, setStatesMap] = useState({});
  const [citiesMap, setCitiesMap] = useState({});
  
  const [activities, setActivities] = useState([]);

  // fetch countries on load
  useEffect(() => {
    fetch("http://localhost:53140/destinations/countries")
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error(err));
  }, []);

  // fetch activities on load
  useEffect(() => {
    fetch("http://localhost:53140/activities")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Error fetching activities:", err));
      setActivities([]);
  }, []);

  // update destination field
  const handleDestinationChange = (index, field, value) => {
    setDestinations(latestState => {
      const updated = [...latestState];
      updated[index][field] = value;
      return updated;
    });
  };

  // add a new destination form 
  const addDestination = () => {
    setDestinations(latestState => [...latestState, { country_id: "", state_id: "", city_id: "", start_date: "", end_date: "", notes: "" }]);
  };

  // remove a destination
  const removeDestination = (index) => {
    setDestinations(latestState => latestState.filter((_, i) => i !== index));
    setStatesMap(latestState => {
      const copy = { ...latestState };
      delete copy[index];
      return copy;
    });
    setCitiesMap(latestState => {
      const copy = { ...latestState };
      delete copy[index];
      return copy;
    });
  };

  // validates the form inputs
  const validateForm = () => {
    const errors = [];

    // at least one destination with city
    const hasDestination = destinations.some(dest => dest.city_id);
    if (!hasDestination) errors.push("At least one destination must be selected");

    // check each destination's start/end dates
    destinations.forEach((dest, index) => {
      if (dest.start_date && dest.end_date && dest.start_date > dest.end_date) {
        errors.push(`Destination #${index + 1} start date cannot be after end date`);
      }
    });

    return errors;
  };

  // submit the destination
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n")); // or setErrors(errors) for inline display
      return; // stop here
    }

    try {
      // create the destination
      for (let index = 0; index < destinations.length; index++) {
        const dest = destinations[index];

        if (!dest.city_id) continue; // skip incomplete

        const countryName = countries.find(country => country.id === dest.country_id)?.name || "";
        const stateName = statesMap[index]?.find(state => state.id == dest.state_id)?.name || "";
        const cityName = citiesMap[index]?.find(city => city.id === dest.city_id)?.name || "";

        const destination_name = cityName + (stateName ? `, ${stateName}` : "") + `, ${countryName}`;

        const destRes = await fetch("http://localhost:53140/destinations/new-destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...dest, trip_id: tripId, destination_name }),
        });

        if (!destRes.ok) {
          const errData = await destRes.json();
          alert(`Failed to add destination #${index + 1}: ${errData.error || destRes.statusText}`);
          return; // stop redirect
        }
      }

      navigate(`/trips/${tripId}`);

    } catch (err) {
      console.error("Error adding destination:", err);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate(`/trips/${tripId}`)}>← Cancel</button>

      <div className="form-container">
        <h2 className="form-title">Add Destinations</h2>

        {destinations.map((dest, index) => (
          <div key={index} className="form-box" style={{ gap: "0.5rem" }}>
            <h3>Destination #{index + 1}</h3>

            {/* Sprint #3 task */}
            {/* TO-DO: Add a "search" effect that only shows destinations that start with that letter as you type it 
            EX: Typing "United" would only show United Arab Emirates, United Kingdom, and United States */}
            {/* Also add this feature to states and cities */}

            {/* Country */}
            <div className="form-group">
              <label>Country</label>
              <select
                value={dest.country_id}
                onChange={async (event) => {
                  const countryId = event.target.value;
                  handleDestinationChange(index, "country_id", countryId);
                  handleDestinationChange(index, "state_id", "");
                  handleDestinationChange(index, "city_id", "");

                  const resStates = await fetch(`http://localhost:53140/destinations/states/${countryId}`);
                  const statesData = await resStates.json();
                  setStatesMap(latest => ({ ...latest, [index]: statesData }));

                  // if there are no states, then fetch cities for the country
                  if (statesData.length === 0) {
                    const resCities = await fetch(`http://localhost:53140/destinations/cities/country/${countryId}`);
                    const citiesData = await resCities.json();
                    setCitiesMap(latest => ({ ...latest, [index]: citiesData }));
                  } else {
                    setCitiesMap(latest => ({ ...latest, [index]: [] }));
                  }
                }}
              >
                <option value="">Select Country</option>
                {countries.map(country => <option key={country.id} value={country.id}>{country.name}</option>)}
              </select>
            </div>

            {/* State */}
            {statesMap[index]?.length > 0 && (
              <div className="form-group">
                <label>State</label>
                <select
                  value={dest.state_id}
                  onChange={async (event) => {
                    const stateId = event.target.value;
                    handleDestinationChange(index, "state_id", stateId);
                    handleDestinationChange(index, "city_id", "");

                    const resCities = await fetch(`http://localhost:53140/destinations/cities/state/${stateId}`);
                    const citiesData = await resCities.json();
                    setCitiesMap(latest => ({ ...latest, [index]: citiesData }));
                  }}
                >
                  <option value="">Select State</option>
                  {statesMap[index].map(state => <option key={state.id} value={state.id}>{state.name}</option>)}
                </select>
              </div>
            )}

            {/* City */}
            <div className="form-group">
              <label>City</label>
              <select
                value={dest.city_id}
                onChange={(event) => handleDestinationChange(index, "city_id", event.target.value)}
              >
                <option value="">Select City</option>
                {citiesMap[index]?.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </div>

            {/* Start/End Dates */}
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={dest.start_date} onChange={event => handleDestinationChange(index, "start_date", event.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={dest.end_date} onChange={event => handleDestinationChange(index, "end_date", event.target.value)} />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea value={dest.notes} onChange={event => handleDestinationChange(index, "notes", event.target.value)} />
            </div>

            <div className="form-group">
              <label>Activities</label>
              <select
                multiple
                value={dest.activity_ids}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions).map(opt =>
                    Number(opt.value)
                  );

                  handleDestinationChange(index, "activity_ids", selectedValues);
                }}
                style={{ height: "120px" }} // optional for visibility
              >
                {activities.map(activity => (
                  <option key={activity.activity_id} value={activity.activity_id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="form-button" onClick={() => removeDestination(index)}>
              Remove Destination
            </button>
          </div>
        ))}

        <button type="button" className="form-button" onClick={addDestination}>
          + Add Destination
        </button>

        <button type="button" onClick={handleSubmit}>
          Save Destinations
        </button>

      </div>
    </div>
  );
}

export default NewDestinations;