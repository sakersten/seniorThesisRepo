// central database abstraction layer for the application
// initializes PostgreSQL connection pool and contains all DB queries for users, trips, destinations, activities, and closet_items
// this file ONLY interacts with the database - keeps SQL logic separate from controllers and services

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
  async createClosetItem(google_id, item_category, item_sub_category, warmth_level, is_waterproof, is_layerable, color, material, formality) {
    let client;

    try {
      client = await this.pool.connect();
      const sql = `
        INSERT INTO public."closet_items"
          (google_id, item_category, item_subcategory, warmth_level, is_waterproof, is_layerable, color, material, formality)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
        material,
        formality
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

      // pulling longitude/latitude for weather APIs
      const sql = `
        SELECT public."destinations".*, 
          COALESCE(
            public."cities".latitude,
            public."states".latitude,
            public."countries".latitude
          ) AS latitude,
          COALESCE(
            public."cities".longitude,
            public."states".longitude,
            public."countries".longitude
          ) AS longitude
        FROM public."destinations"
        JOIN public."trips"
          ON public."destinations".trip_id = public."trips".trip_id
        LEFT JOIN public."cities"
          ON public."destinations".city_id = public."cities".id
        LEFT JOIN public."states"
          ON public."destinations".state_id = public."states".id
        LEFT JOIN public."countries"
          ON public."destinations".country_id = public."countries".id
        WHERE public."destinations".trip_id = $1
          AND public."trips".google_id = $2
        ORDER BY public."destinations".start_date ASC;
      `;

      const result = await client.query(sql, [trip_id, google_id]);
      //console.log(result.rows);
      return result.rows;
      
    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // TO-DO: figure out date issues.. why is the start date/end date for trips failing yet, despite all of these checks?
  // create a new destination in a trip
  async createDestination({trip_id, destination_name, start_date, end_date, notes,
    city_id, state_id, country_id, google_id, activity_ids }) {
    let client;

    try {
      client = await this.pool.connect();

      await client.query("BEGIN");

      // 1. get trip (also enforces ownership)
      const tripRes = await client.query(
        `SELECT start_date, end_date
        FROM public."trips"
        WHERE trip_id = $1 AND google_id = $2`,
        [trip_id, google_id]
      );

      const trip = tripRes.rows[0];

      if (!trip) {
        await client.query("ROLLBACK");
        return null;
      }

      const tripStart = trip.start_date;
      const tripEnd = trip.end_date;

      // 2. validate input exists
      if (!start_date || !end_date) {
        await client.query("ROLLBACK");
        throw new Error("Start and end dates are required.");
      }

      // 3. validate date order
      if (start_date > end_date) {
        await client.query("ROLLBACK");
        throw new Error("Start date must be before or equal to end date.");
      }

      // 4. validate within trip bounds (STRING compare works for DATE)
      if (start_date < tripStart || end_date > tripEnd) {
        await client.query("ROLLBACK");
        throw new Error("Destination must be within trip date range.");
      }

      // 5. fetch existing destinations for overlap check
      const existingRes = await client.query(
        `SELECT start_date, end_date
        FROM public."destinations"
        WHERE trip_id = $1`,
        [trip_id]
      );

      // 6. destination overlap check (only one day overlap allowed for destination transitions)
      for (const d of existingRes.rows) {
        const existingStart = d.start_date;
        const existingEnd = d.end_date;

        const overlaps =
          start_date < existingEnd &&
          end_date > existingStart;

        if (overlaps) {
          await client.query("ROLLBACK");
          throw new Error(
            "Destination dates overlap an existing destination. Same-day transitions are allowed."
          );
        }
      }

      // 8. insert destination
      const sql = `
        INSERT INTO public."destinations"
          (trip_id, destination_name, start_date, end_date, notes, city_id, state_id, country_id)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8
        FROM public."trips"
        WHERE trip_id = $1 AND google_id = $9
        RETURNING *;
      `;

      const result = await client.query(sql, [
        trip_id,
        destination_name,
        start_date,
        end_date,
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

      // 9. insert activities into join table
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

  async updateTripDestination(destination_id, google_id, destination_name, start_date, end_date, notes) {
    let client;

    try {
      client = await this.pool.connect();

      const sql = `
        UPDATE public."destinations"
        SET
          destination_name = COALESCE($3, public."destinations".destination_name),
          start_date = COALESCE($4, public."destinations".start_date),
          end_date = COALESCE($5, public."destinations".end_date),
          notes = COALESCE($6, public."destinations".notes)
        FROM public."trips"
        WHERE public."destinations".destination_id = $1
          AND public."destinations".trip_id = public."trips".trip_id
          AND public."trips".google_id = $2
        RETURNING public."destinations".*;
      `;

      const result = await client.query(sql, [
        destination_id,
        google_id,
        destination_name ?? null,
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

  // delete destination
  async removeTripDestination(destination_id, google_id) {
    let client; 
    try {
      client = await this.pool.connect(); 

      const sql = `
        DELETE FROM public."destinations"
        USING public."trips"
        WHERE public."destinations".destination_id = $1
          AND public."destinations".trip_id = public."trips".trip_id
          AND public."trips".google_id = $2
        RETURNING public."destinations".*;
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
        SELECT activities.activity_id, activities.name, activities.packing_tags
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

  // ============================================
  // PACKING LIST METHODS
  // ============================================
  // create a new packing list for a trip (replaces existing if one exists)
  async createPackingList(trip_id, google_id, recommended, conditions) {
    let client;

    try {
      client = await this.pool.connect();

      await client.query("BEGIN");

      // delete existing list for this trip if one exists (regenerate)
      await client.query(
        `DELETE FROM public."packing_lists"
        WHERE trip_id = $1 AND google_id = $2`,
        [trip_id, google_id]
      );

      // insert the new list
      const listRes = await client.query(
        `INSERT INTO public."packing_lists" (trip_id, google_id, conditions)
        VALUES ($1, $2, $3)
        RETURNING list_id`,
        [trip_id, google_id, JSON.stringify(conditions)]
      );

      const list_id = listRes.rows[0].list_id;

      // insert each recommended item
      for (const item of recommended) {
        await client.query(
          `INSERT INTO public."packing_list_items"
            (list_id, trip_id, source_item_id, item_name, category, subcategory, score, is_user_added)
          VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
          [
            list_id,
            trip_id,
            item.item_id,
            item.item_subcategory,
            item.item_category,
            item.item_subcategory,
            item.score
          ]
        );
      }

      await client.query("COMMIT");
      return list_id;

    } catch (err) {
      if (client) await client.query("ROLLBACK");
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // get a saved packing list with full closet item details for a trip
  async getPackingListByTrip(trip_id, google_id) {
    let client;

    try {
      client = await this.pool.connect();

      const listRes = await client.query(
        `SELECT *
        FROM public."packing_lists"
        WHERE trip_id = $1 AND google_id = $2`,
        [trip_id, google_id]
      );

      if (!listRes.rows[0]) return null;

      const list = listRes.rows[0];

    const itemsRes = await client.query(
      `SELECT
         public."packing_list_items".*,
         public."closet_items".color,
         public."closet_items".material,
         public."closet_items".warmth_level,
         public."closet_items".is_waterproof,
         public."closet_items".is_layerable, 
        public."closet_items".formality
       FROM public."packing_list_items"
       LEFT JOIN public."closet_items"
         ON public."packing_list_items".source_item_id = public."closet_items".item_id
       WHERE public."packing_list_items".list_id = $1
       ORDER BY public."packing_list_items".score DESC`,
      [list.list_id]
    );

      return {
        ...list,
        items: itemsRes.rows,
      };

    } catch (err) {
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // toggle is_packed on a single packing list item
  // will add this feature if I have time lol
  // async togglePackedStatus(packing_item_id, google_id) {
  //   let client;

  //   try {
  //     client = await this.pool.connect();

  //     const sql = `
  //       UPDATE public."packing_list_items"
  //       SET is_packed = NOT is_packed
  //       FROM public."packing_lists"
  //       WHERE public."packing_list_items".packing_item_id = $1
  //         AND public."packing_list_items".list_id = public."packing_lists".list_id
  //         AND public."packing_lists".google_id = $2
  //       RETURNING public."packing_list_items".*
  //     `;

  //     const result = await client.query(sql, [packing_item_id, google_id]);

  //     return result.rows[0] ?? null;

  //   } catch (err) {
  //     throw err;
  //   } finally {
  //     if (client) client.release();
  //   }
  // }
}

export default DBAbstraction;