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
 * Add New Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    // Insert the new classification into the classifications table
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name) 
       VALUES ($1) 
       RETURNING classification_id, classification_name`,
      [classification_name]
    );

    // Return the inserted classification data (for potential confirmation or use)
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
 *  Update Inventory Data
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
    // Step 1: SQL Query to Update Inventory Item
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
      RETURNING *`;  // Ensure we return the updated row

    // Step 2: Run the SQL query with the passed-in values
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
      inv_id // Ensure the inventory ID is the last parameter
    ]);

    // Step 3: Check if the update was successful
    if (data.rows.length === 0) {
      console.log("Inventory update failed: No rows were updated.");
      return null;  // If no rows were updated, return null
    }

    // Step 4: Return the updated inventory item
    return data.rows[0]; // Return the updated row
  } catch (error) {
    console.error("Error updating inventory:", error); // Log any errors
    return null; // Return null if there's an error
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

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventoryItem, updateInventoryItem, deleteInventoryItem };