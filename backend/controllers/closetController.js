// handles closet database functionality

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import dotenv from 'dotenv'; 
dotenv.config(); 

// create a new closet item
const createClosetItem = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id; // get user from session
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const {
      item_category,
      item_sub_category,
      warmth_level,
      is_waterproof,
      is_layerable,
      color,
      material
    } = req.body;

    if (!item_category || !item_sub_category) {
      return res.status(400).json({ error: "Missing required fields: item_category or item_sub_category" });
    }

    const newItem = await db.createClosetItem(
      google_id,
      item_category,
      item_sub_category,
      warmth_level ?? 0,
      is_waterproof ?? false,
      is_layerable ?? false,
      color ?? null,
      material ?? null
    );

    res.status(201).json(newItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all closet items for a given user
const getClosetItems = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const items = await db.getClosetItemsByUser(google_id);
    res.json(items);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all closet items for a given category
const getClosetByCategory = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const { item_category, item_sub_category } = req.query;

    if (!item_category) {
      return res.status(400).json({ error: "item_category is required" });
    }

    const items = await db.getClosetItemsByCategory(
      google_id,
      item_category,
      item_sub_category
    );

    res.json(items);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// get all closet items for a given warmth level
const getClosetByWeather = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const { warmth_level } = req.query;

    if (!warmth_level) {
      return res.status(400).json({ error: "warmth_level is required" });
    }

    const items = await db.getClosetItemsByWeather(
      google_id,
      Number(warmth_level)
    );

    res.json(items);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// delete for the specific closet item #; needs user id validation too
const deleteClosetItem = async (req, res) => {
  try {
    const google_id = req.session.user?.google_id;
    if (!google_id) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const item_id = req.params.id;

    const deletedItem = await db.deleteClosetItem(item_id, google_id);

    if (!deletedItem) {
      return res.status(404).json({
        error: "Item not found or not authorized"
      });
    }

    res.json({ message: "Item deleted", item: deletedItem });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export default {
    createClosetItem, 
    getClosetItems, 
    getClosetByCategory, 
    getClosetByWeather, 
    deleteClosetItem
}