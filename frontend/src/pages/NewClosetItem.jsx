import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from '@mui/material'; // import for slider; more aesthetic

function NewClosetItem() {
  const navigate = useNavigate();

  // hard-coded categories/subcategories for dropdowns
  const categories = {
    Tops: ["T-Shirt", "Tank Top", "Long Sleeve", "Sweater"],
    Bottoms: ["Jeans", "Shorts", "Leggings", "Skirt"],
    Dresses: ["Casual Dress", "Evening Dress"], 
    Outerwear: ["Windbreaker", "Coat", "Rain Jacket"],
    Footwear: ["Sneakers", "Boots", "Sandals"],
    Accessories: ["Hat", "Scarf", "Gloves"]
  };

  // hard-coded materials for dropdown
  const materials = ["Cashmere", "Cotton", "Denim", "Flannel", "Fur", "Leather", "Linen", "Nylon", "Polyester", "Silk", "Spandex", "Wool"]; 

  // hard-coded colors for dropdown -> tbd if I want to do this or not since some people are specific with color descrptions
  const colors = [""]; 

  // form state
  const [formData, setFormData] = useState({
    item_category: "",
    item_sub_category: "",
    warmth_level: 0,
    is_waterproof: false,
    is_layerable: false,
    color: "",
    material: ""
  });

  // handle input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // update the form state
    setFormData((latestState) => {
      if (name === "item_category") {
        // reset subcategory if category changes
        return {
          ...latestState, // reverts current/previous state before updating
          item_category: value, // update category
          item_sub_category: "" // reset subcategory to empty (since it depends on the category)
        };
      }

      // for everything else (text, checkboxes)
      return {
        ...latestState, // keep current state
        [name]: type === "checkbox" ? checked : value // update changed value
      };
    });
  };

  // handles the submission of the form
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    try {
      const res = await fetch("http://localhost:53140/closet/new-closet-item", { // MUST hard-code route, otherwise it will not work with frontend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          warmth_level: Number(formData.warmth_level) // verification that warmth_level is a number
        })
      });

      let data = null;
      try {
        data = await res.json(); // try parsing JSON
      } catch {
        console.warn("No JSON in response"); // if the response is empty/not JSON
      }

      console.log("RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add item");
      }

      navigate("/closet");

    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/closet")}>
        ← Cancel
      </button>

      <div className="form-container">
        <form className="form-box" onSubmit={handleSubmit}>
          <h1 className="form-title">New Closet Item</h1>

          {/* Category Dropdown */}
          <select
            name="item_category"
            value={formData.item_category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Subcategory Dropdown */}
          <select
            name="item_sub_category"
            value={formData.item_sub_category}
            onChange={handleChange}
            required
            disabled={!formData.item_category}
          >
            <option value="">Select Subcategory</option>
            {formData.item_category &&
              categories[formData.item_category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
          </select>

          {/* Warmth Level */}
          <div style={{ width: 300, margin: "20px" }}>
            <div style={{ marginBottom: "8px", fontWeight: "500" }}>
              Warmth Level
            </div>
            <Slider
              value={formData.warmth_level}     // use state
              onChange={(event, newValue) =>    // MUI Slider passes (event, newValue)
                setFormData((latestState) => ({
                  ...latestState,
                  warmth_level: newValue
                }))
              }
              step={10}
              marks
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{
                "& .MuiSlider-track": {
                  background: `linear-gradient(to right, blue, red)`,
                },
                "& .MuiSlider-thumb": {
                  borderColor: "black",
                },
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "blue" }}>Low Warmth</span>
              <span style={{ color: "red" }}>High Warmth</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_waterproof"
                checked={formData.is_waterproof}
                onChange={handleChange}
              />
              Waterproof
            </label>

            <label>
              <input
                type="checkbox"
                name="is_layerable"
                checked={formData.is_layerable}
                onChange={handleChange}
              />
              Layerable
            </label>
          </div>

          {/* Color */}
          <div className="form-group">
            <label>Color</label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          {/* Material */}
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            required
          >
            <option value="">Select Material</option>
            {materials.map((mat) => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>

          <button type="submit" className="form-button">
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewClosetItem;