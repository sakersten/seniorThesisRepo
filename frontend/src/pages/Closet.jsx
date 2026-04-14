import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Closet() {
  const navigate = useNavigate();

  const [closet, setCloset] = useState([]); 

  // fetch existing closet items on page load
  useEffect(() => {
    fetch("http://localhost:53140/closet/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCloset(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      <h1>Closet Items</h1>

      {/* Link to add new item */}
      <button
        className="form-button"
        onClick={() => navigate("/new-closet-item")}>
        + New Closet Item
      </button>

      {/* add filtering functionality -> item category/subcategory, weather type (by warmth level probably), etc.
      they would act as buttons and then would filter the items when clicked (and then filter would be removed when clicked again) 
      add later -> sprint #3 work! */}


      {/* TO-DO: make more aesthetic */}  
      {closet.length === 0 ? (
        <p>No closet items yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Warmth Level</th>
              <th>Waterproof</th>
              <th>Layerable</th>
              <th>Color</th>
              <th>Material</th>
            </tr>
          </thead>

          <tbody>
            {closet.map((item) => (
              <tr key={item.item_id}>
                <td>{item.item_category}</td>
                <td>{item.item_subcategory}</td>
                <td>{item.warmth_level}</td>
                <td>{item.waterproof ? "Yes" : "No"}</td>
                <td>{item.layerable ? "Yes" : "No"}</td>
                <td>{item.color}</td>
                <td>{item.material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default Closet;