// this file just sets up PostgreSQL
import dotenv from "dotenv";
dotenv.config();

import {Pool} from 'pg'; 

class DBAbstraction {
  pool = null

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,       
      host: process.env.DB_HOST,       
      database: process.env.DB_NAME,   
      password: process.env.DB_PASS,   
      port: process.env.DB_PORT,       
    });
  }

  // ============================================
  // USER METHODS
  // ============================================

  // finds a user based on their google_id
  async findUser(google_id) {
    return new Promise(async (resolve, reject) => {
      let client;

            try {
        client = await this.pool.connect();
        const sql = `
          SELECT *
          FROM public."users"
          WHERE google_id = $1;
        `;

        const response = await client.query(sql, [google_id]);

        resolve(response.rows.length === 1); // if there was a user found, 
      } catch (err) {
        reject(err); 
      } finally {
        if (client) client.release(); 
      }
    });
  }

  // inserts a new user into the database
  async insertNewUser(google_id, email, name) {
    return new Promise(async (resolve, reject) => {
      let client;

      try {
        client = await this.pool.connect();
        const sql = `
          INSERT INTO users (google_id, email, name) 
          VALUES ($1, $2, $3)
          RETURNING *;
        `;
        
        const response = await client.query(sql, [google_id, email, name]);

        resolve(response); 
      } catch (err) {
        reject(err); 
      } finally {
        if (client) client.release(); 
      }
    });
  }

  // ============================================
  // CLOSET METHODS
  // ============================================

  // create a new closet item
  async createClosetItem(google_id, item_category, item_sub_category, warmth_level, is_waterproof, is_layerable, color, material) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        INSERT INTO public."closet_items"
          (google_id, item_category, item_subcategory, warmth_level, is_waterproof, is_layerable, color, material)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *;
      `;

      const result = await client.query(sql, [
        google_id,
        item_category,
        item_sub_category,
        warmth_level,
        is_waterproof,
        is_layerable,
        color,
        material
      ]);

      return result.rows[0];

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // retrieve all closet items for a given user
  async getClosetItemsByUser(google_id) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        SELECT *
        FROM public."closet_items"
        WHERE google_id = $1;
      `;

      const response = await client.query(sql, [google_id]);

      return response.rows;
    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // filter the closet items by category/subcategory -> this will help with the Closet page later down the line
  // I want to incorporate buttons to filter the closet by a specific category, or even a subcategory within a category. 
  async getClosetItemsByCategory(google_id, item_category, item_sub_category) {
    const client = await this.pool.connect();

    try {
      // if subcategory is provided
      if (item_sub_category) {
        const result = await client.query(
          `SELECT * FROM closet_items
          WHERE google_id = $1
          AND item_category = $2
          AND item_sub_category = $3`,
          [google_id, item_category, item_sub_category]
        );

        return result.rows;
      }

      // if NO subcategory
      const result = await client.query(
        `SELECT * FROM closet_items
        WHERE google_id = $1
        AND item_category = $2`,
        [google_id, item_category]
      );

      return result.rows;

    } finally {
      client.release();
    }
  }

  // get all closet items for a given warmth level (will help with weather-specific packing!)
  async getClosetItemsByWeather(google_id, warmth_level) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        SELECT *
        FROM closet_items
        WHERE google_id = $1
          AND warmth_level <= $2
        ORDER BY warmth_level DESC;
      `;

      const result = await client.query(sql, [google_id, warmth_level]);
      return result.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // delete a closet item
  async deleteClosetItem(item_id, google_id) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        DELETE FROM closet_items
        WHERE item_id = $1 AND google_id = $2
        RETURNING *;
      `;

      const result = await client.query(sql, [item_id, google_id]);

      return result.rows[0]; // undefined if not found or not owned
    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // ============================================
  // ACTIVITY METHODS
  // ============================================

  // retrieve all activities
  async getActivities() {
    return new Promise(async (resolve, reject) => {
      let client;

      try {
        client = await this.pool.connect();
        const sql = `
          SELECT *
          FROM public."activities";
        `;

        const response = await client.query(sql);

        resolve(response.rows); // return data
      } catch (err) {
        reject(err); // handle error
      } finally {
        if (client) client.release(); // always release
      }
    });
  }

  // ============================================
  // TRIP METHODS
  // ============================================

  // create a new trip
  async createTrip(google_id, title, start_date, end_date, notes = null) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        INSERT INTO public."trips" (google_id, title, start_date, end_date, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      const result = await client.query(sql, [google_id, title, start_date, end_date, notes]);
      return result.rows[0];

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }
  
  // get all upcoming trips for a user
  async getUpcomingTripsByUser(google_id) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        SELECT *
        FROM public."trips"
        WHERE google_id = $1
        AND end_date >= CURRENT_DATE
        ORDER BY start_date ASC;
      `;

      const result = await client.query(sql, [google_id]);
      return result.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get past trips for a user (archive of previous trips)
  async getPastTripsByUser(google_id) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        SELECT *
        FROM public."trips"
        WHERE google_id = $1
        AND end_date < CURRENT_DATE
        ORDER BY start_date ASC;
      `;

      const result = await client.query(sql, [google_id]);
      return result.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // update a trip 
  async updateTrip(trip_id, google_id, title, start_date, end_date, notes) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        UPDATE trips
        SET
          title = COALESCE($3, title),
          start_date = COALESCE($4, start_date),
          end_date = COALESCE($5, end_date),
          notes = COALESCE($6, notes)
        WHERE trip_id = $1
          AND google_id = $2
        RETURNING *;
      `;

      const result = await client.query(sql, [
        trip_id,
        google_id,
        title ?? null,
        start_date ?? null,
        end_date ?? null,
        notes ?? null
      ]);

      return result.rows[0] || null;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // delete a trip 
  async deleteTrip(trip_id, google_id) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        DELETE FROM public."trips"
        WHERE trip_id = $1 AND google_id = $2
        RETURNING *;
      `;

      const result = await client.query(sql, [trip_id, google_id]);

      return result.rows[0]; // will be undefined if nothing deleted
    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // ============================================
  // DESTINATION METHODS
  // ============================================

  // get all countries 
  async getCountries() {
    const result = await this.pool.query(`
      SELECT id, name
      FROM public."countries"
      ORDER BY name ASC;
    `);
    return result.rows;
  }

  // get all states by country id
  async getStatesByCountry(countryId) {
    const result = await this.pool.query(`
      SELECT id, name
      FROM public."states"
      WHERE country_id = $1
      ORDER BY name ASC;
    `, [countryId]);

    return result.rows;
  }

  // get all cities by state id (if applicable)
  async getCitiesByState(stateId) {
    const result = await this.pool.query(`
      SELECT id, name
      FROM public."cities"
      WHERE state_id = $1
      ORDER BY name ASC
    `, [stateId]);

    return result.rows;
  }

  // get all cities by country id (if state is not applicable)
  async getCitiesByCountry(countryId) {
    const result = await this.pool.query(`
      SELECT id, name
      FROM public."cities"
      WHERE country_id = $1
      ORDER BY name ASC
    `, [countryId]);

    return result.rows;
  }

  // // get all destinations by user 
  // async getAllDestinationsByUser(google_id) {
  //   const result = await this.pool.query(`
  //     TO-DO
  //   `, [google_id]);

  //   return result.rows;
  // }

  // delete destination
  async removeTripDestination(trip_id, google_id) {
    const result = await this.pool.query(`
      UPDATE trips
      SET city_id = NULL
      WHERE id = $1 AND google_id = $2
      RETURNING *;
    `, [trip_id, google_id]);

    return result.rows[0];
  }

  // ============================================
  // DESTINATION ACTIVITIES METHODS
  // ============================================

  // to-do :)
}

export default DBAbstraction;