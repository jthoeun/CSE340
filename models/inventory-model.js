const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error in getInventoryByClassificationId: " + error);
  }
}

/* ***************************
 * Get a specific vehicle by its inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Return the first (and only) result
  } catch (error) {
    console.error("Error in getVehicleById: " + error);
  }
}

/* ***************************
 * Get reviews for a specific vehicle by its inv_id
 * ************************** */
async function getReviewById(inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, 
             a.account_firstname  -- Change 'accounts' to 'account'
      FROM public.reviews AS r
      JOIN public.account AS a ON r.account_id = a.account_id  -- Change 'accounts' to 'account'
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC`; // Fetch reviews, ordered by date (most recent first)
    const data = await pool.query(sql, [inv_id]);
    return data.rows; // Return reviews
  } catch (error) {
    console.error("Error fetching reviews: " + error);
    return []; // Return an empty array in case of error
  }
}

/* ***************************
 * Add a New Review
 * ************************** */
async function addReview(review) {
  try {
    const sql = `
      INSERT INTO public.reviews (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *`; // Return the inserted row to confirm
    const result = await pool.query(sql, [review.review_text, review.inv_id, review.account_id]);

    return result.rows[0];  // Return the inserted review object
  } catch (error) {
    console.error("Error adding review:", error);
    return null; // Return null if there's an error
  }
}



/* ***************************
 * Add New Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name) 
       VALUES ($1) 
       RETURNING classification_id, classification_name`,
      [classification_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in addClassification: " + error);
    throw error;
  }
}

/* ***************************
 * Add New inventory
 * ************************** */
async function addInventoryItem(vehicle) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const params = [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_color,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding inventory:", error);
    return null;
  }
}

/* ***************************
 * Update Inventory Data
 * ************************** */
async function updateInventoryItem(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET 
        inv_make = $1,
        inv_model = $2,
        inv_description = $3,
        inv_image = $4,
        inv_thumbnail = $5,
        inv_price = $6,
        inv_year = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    if (data.rows.length === 0) {
      console.log("Inventory update failed: No rows were updated.");
      return null;
    }
    return data.rows[0];
  } catch (error) {
    console.error("Error updating inventory:", error);
    return null;
  }
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return 0;
  }
}

/* ***************************
 * Get Reviews by Account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, v.inv_make, v.inv_model, r.review_id
      FROM public.reviews AS r
      JOIN public.inventory AS v ON r.inv_id = v.inv_id
      JOIN public.account AS a ON r.account_id = a.account_id  -- Change 'accounts' to 'account'
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC`;
    const data = await pool.query(sql, [account_id]);
    return data.rows; // Return reviews
  } catch (error) {
    console.error("Error fetching reviews by account:", error);
    return [];  // Return an empty array in case of error
  }
}


/* ***************************
 * Update Review in Database
 * ************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE public.reviews
      SET review_text = $1
      WHERE review_id = $2
      RETURNING *`; // Return the updated row to confirm
    const result = await pool.query(sql, [review_text, review_id]);

    return result.rows[0];  // Return the updated review object
  } catch (error) {
    console.error("Error updating review:", error);
    return null; // Return null if there's an error
  }
}


module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  getReviewById, 
  addReview, 
  addClassification, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getReviewsByAccountId,
  updateReview, 
};