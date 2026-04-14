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
          FROM public."activities"
          ORDER BY name;
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

  // get all information about a specific trip using the id
  async getTripDetailsById(trip_id, google_id) {
    let client; 

    try {
      client = await this.pool.connect();
      const sql = `
        SELECT *
        FROM public."trips"
        WHERE trip_id = $1 AND google_id = $2
      `;

      const result = await client.query(sql, [trip_id, google_id]);
      return result.rows[0];

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
    let client; 
    try {
      client = await this.pool.connect(); 
  
      const sql = await client.query(`
        SELECT id, name
        FROM public."countries"
        ORDER BY name ASC;
      `);

      return sql.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get all states by country id
  async getStatesByCountry(countryId) {
    let client; 
    try {
      client = await this.pool.connect(); 
  
      const sql = await client.query(`
        SELECT id, name
        FROM public."states"
        WHERE country_id = $1
        ORDER BY name ASC;
      `,[countryId]);

      return sql.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get all cities by state id (if applicable)
  async getCitiesByState(stateId) {
    let client; 
    try {
      client = await this.pool.connect(); 
  
      const sql = await client.query(`
        SELECT id, name
        FROM public."cities"
        WHERE state_id = $1
        ORDER BY name ASC
      `,[stateId]);

      return sql.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get all cities by country id (if state is not applicable)
  async getCitiesByCountry(countryId) {
    let client; 
    try {
      client = await this.pool.connect(); 
  
      const sql = await client.query(`
        SELECT id, name
        FROM public."cities"
        WHERE country_id = $1
        ORDER BY name ASC
      `,[countryId]);

      return sql.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get all destinations for a specific trip
  async getDestinationsByTrip(trip_id, google_id) {
    let client;
    try {
      client = await this.pool.connect();

      const sql = `
        SELECT public."destinations".*
        FROM public."destinations"
        JOIN public."trips"
          ON public."destinations".trip_id = public."trips".trip_id
        WHERE public."destinations".trip_id = $1
          AND public."trips".google_id = $2
        ORDER BY public."destinations".order_index ASC;
      `;

      const result = await client.query(sql, [trip_id, google_id]);
      return result.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // create a new destination in a trip
  // TO-DO: Add error handling for if destination dates are outside of trip scope
  //        OR if destination dates overlap (they can only overlap by one day, since 
  //        you may be leaving for a new location)
  async createDestination({trip_id, destination_name, start_date, end_date, order_index, notes,
    city_id, state_id, country_id, google_id, activity_ids }) {
    let client;

    try {
      client = await this.pool.connect();

      await client.query("BEGIN");

      // 1. insert destination
      const sql = `
        INSERT INTO public."destinations"
          (trip_id, destination_name, start_date, end_date, order_index, notes, city_id, state_id, country_id)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
        FROM public."trips"
        WHERE trip_id = $1 AND google_id = $10
        RETURNING *;
      `;

      const result = await client.query(sql, [
        trip_id,
        destination_name,
        start_date,
        end_date,
        order_index,
        notes,
        city_id,
        state_id,
        country_id,
        google_id
      ]);

      const newDestination = result.rows[0];

      // if unauthorized or failed
      if (!newDestination) {
        await client.query("ROLLBACK");
        return null;
      }

      const destination_id = newDestination.destination_id;

      // 2. insert activities into join table
      if (activity_ids && activity_ids.length > 0) {
        for (const activity_id of activity_ids) {
          await client.query(
            `
            INSERT INTO public."destination_activities"
              (destination_id, activity_id)
            VALUES ($1, $2)
            `,
            [destination_id, activity_id]
          );
        }
      }

      await client.query("COMMIT");

      return newDestination;

    } catch (err) {
      if (client) await client.query("ROLLBACK");
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // delete destination
  async removeTripDestination(destination_id, google_id) {
    let client; 

    try {
      client = await this.pool.connect(); 

      const sql = `
      DELETE FROM public."destinations"
      USING public."trips"
      WHERE destination_id = $1
        AND destination.trip_id = trip.trip_id
        AND trip.google_id = $2
      RETURNING *
    `;

    const result = await client.query(sql, [destination_id, google_id]);

    return result.rows[0]; // undefined if nothing deleted / not authorized

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // ============================================
  // DESTINATION ACTIVITY METHODS
  // ============================================

  // add a new activity to a destination
  async addActivitiesToDestination(destination_id, activity_ids) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        INSERT INTO public."destination_activities" (destination_id, activity_id)
        VALUES ($1, $2)
        ON CONFLICT (destination_id, activity_id) DO NOTHING
      `;

      for (let activity_id of activity_ids) {
        await client.query(sql, [destination_id, activity_id]);
      }

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  async getActivitiesForDestination(destination_id) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        SELECT activities.activity_id, activities.name
        FROM public."destination_activities"
        JOIN public."activities"
          ON destination_activities.activity_id = activities.activity_id
        WHERE destination_activities.destination_id = $1
        ORDER BY activities.name ASC
      `;

      const result = await client.query(sql, [destination_id]);

      return result.rows;

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

}

export default DBAbstraction;