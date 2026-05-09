// orchestrates everything for generating the packing list

import { createPackingListForTrip } from "../services/packingService.js";
import DBAbstraction from "../db.js";

const db = new DBAbstraction();

const generatePackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.session.userId;

    const list = await createPackingListForTrip(tripId, userId);

    res.json(list);
  } catch (err) {
    console.log("ERROR:", err.message);  // add this
    res.status(500).json({ error: err.message });
  }
};

const getPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.session.userId;

    const list = await db.getPackingListByTrip(tripId, userId);

    if (!list) return res.status(404).json({ error: "No packing list found" });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const togglePacked = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.userId;

    const updated = await db.togglePackedStatus(itemId, userId);
    console.log("togglePacked result:", updated);

    if (!updated) return res.status(404).json({ error: "Item not found" });

    res.json(updated);
  } catch (err) {
    console.log("togglePacked ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export default { 
  generatePackingList,
  getPackingList, 
  togglePacked
 };