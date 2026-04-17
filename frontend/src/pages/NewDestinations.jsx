import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select"; // for search dropdown select


function NewDestinations() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [countries, setCountries] = useState([]);
  const [states, setStatesMap] = useState({});
  const [cities, setCitiesMap] = useState({});
  
  const [activities, setActivities] = useState([]);

  const countryOptions = countries.map(country => ({
    value: country.id,
    label: country.name
  }));

  const getStateOptions = (index) => {
    return (states[index] || []).map(state => ({
      value: state.id,
      label: state.name
    }));
  };

  const getCityOptions = (index) => {
    return (cities[index] || []).map(city => ({
      value: city.id,
      label: city.name
    }));
  };

  const activityOptions = activities.map(activity => ({
    value: activity.activity_id,
    label: activity.name
  }));

  const [destinations, setDestinations] = useState([
    { country_id: "", state_id: "", city_id: "", start_date: "", end_date: "", notes: "", activity_ids: [] }
  ]);

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
    setDestinations(latestState => [...latestState, { country_id: "", state_id: "", city_id: "", start_date: "", end_date: "", notes: "", activity_ids: []}]);
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

    // have a country, state, or city input -> not all countries have states; not all countries have cities (ex: Anartica)
    const hasDestination = destinations.some(
      dest => dest.country_id || dest.state_id || dest.city_id
    );

    if (!hasDestination) {
      errors.push("At least one country, state, or city must be selected");
    }

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

        if (!dest.country_id && !dest.state_id && !dest.city_id) continue;

        const countryName = countries.find(country => country.id === dest.country_id)?.name || "";
        const stateName = states[index]?.find(state => state.id == dest.state_id)?.name || "";
        const cityName = cities[index]?.find(city => city.id === dest.city_id)?.name || "";
        
        // piece together the destination name 
        const parts = [];
        if (cityName) parts.push(cityName);
        if (stateName) parts.push(stateName);
        if (countryName) parts.push(countryName);
        const destination_name = parts.join(", ");

        // piece together items to return to db (nulls if blank)
        const payload = {
          trip_id: Number(tripId),
          destination_name,
          country_id: dest.country_id || null,
          state_id: dest.state_id || null,
          city_id: dest.city_id || null,
          start_date: dest.start_date || null,
          end_date: dest.end_date || null,
          notes: dest.notes || null,
          activity_ids: dest.activity_ids || []
        };

        const destRes = await fetch("http://localhost:53140/destinations/new-destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
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

            {/* Country */}
            <div className="form-group">
              <label>Country</label>

              {/* Search Input */}
              <Select
                options={countryOptions}
                placeholder="Select Country"
                value={countryOptions.find(opt => opt.value === dest.country_id) || null}
                onChange={async (selectedOption) => {
                  const countryId = selectedOption.value;

                  // set selected value 
                  handleDestinationChange(index, "country_id", countryId);
                  handleDestinationChange(index, "state_id", "");
                  handleDestinationChange(index, "city_id", "");

                  // fetch states 
                  const resStates = await fetch(`http://localhost:53140/destinations/states/${countryId}`);
                  const statesData = await resStates.json();
                  setStatesMap(latestState => ({ ...latestState, [index]: statesData }));

                  // if there are no states, then fetch cities for the country
                  if (statesData.length === 0) {
                    const resCities = await fetch(`http://localhost:53140/destinations/cities/country/${countryId}`);
                    const citiesData = await resCities.json();
                    setCitiesMap(latestState => ({ ...latestState, [index]: citiesData }));
                  } else {
                    setCitiesMap(latestState => ({ ...latestState, [index]: [] }));
                  }
                }}
                isSearchable
              />
            </div>

            {/* State */}
            {states[index]?.length > 0 && (
              <div className="form-group">
                <label>State</label>
                <Select
                  options={getStateOptions(index)}
                  placeholder="Select State"
                  value={getStateOptions(index).find(opt => opt.value === dest.state_id) || null}
                  onChange={async (selectedOption) => {
                    const stateId = selectedOption.value;

                    handleDestinationChange(index, "state_id", stateId);
                    handleDestinationChange(index, "city_id", "");

                    const resCities = await fetch(`http://localhost:53140/destinations/cities/state/${stateId}`);
                    const citiesData = await resCities.json();
                    setCitiesMap(latestState => ({ ...latestState, [index]: citiesData }));
                  }}
                  isSearchable
                />
              </div>
            )}

            {/* City */}
            <div className="form-group">
              <label>City</label>
              <Select
                options={getCityOptions(index)}
                placeholder="Select City"
                value={getCityOptions(index).find(opt => opt.value === dest.city_id) || null}
                onChange={(selectedOption) => {
                  handleDestinationChange(index, "city_id", selectedOption.value);
                }}
                isSearchable
              />
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

            {/* Activities */}
            <div className="form-group">
              <label>Activities</label>
              <Select
                isMulti
                options={activityOptions}
                value={activityOptions.filter(opt =>
                  dest.activity_ids.includes(opt.value)
                )}
                onChange={(selectedOptions) => {
                  handleDestinationChange(
                    index,
                    "activity_ids",
                    selectedOptions ? selectedOptions.map(s => s.value) : []
                  );
                }}
              />
            </div>

          <button type="button" className="form-button" onClick={() => removeDestination(index)}>
            Cancel
          </button>
        </div>
      ))}

      <div className="button-row">
        <button type="button" className="form-button" onClick={addDestination}>
          + Add Destination
        </button>
        <button type="button" className="save-button" onClick={handleSubmit}>
          Save Destinations
        </button>
      </div>
    </div>
  </div>
)};

export default NewDestinations;