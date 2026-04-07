import { useNavigate } from "react-router-dom";

function NewClosetItem() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/closet")}>
        ← Back to Closet
      </button>

      <h1>New Closet Item</h1>
    </div>
  );
}

export default NewClosetItem;