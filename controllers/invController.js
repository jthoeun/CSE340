const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Build Inventory Management View
 * *************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationOptions = await utilities.getClassifications();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flashMessage: req.flash("notice") || null, // Display flash messages if any
      classificationOptions,
    });
  } catch (err) {
    next(err);
  }
};


/* ***************************
 * Build Edit Inventory View
 * *************************** */
invCont.editInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // Collect inventory ID
  if (isNaN(inv_id)) {
    console.log("Invalid inv_id:", req.params.inv_id); // Log for debugging
    return res.status(400).send("Invalid vehicle ID");
  }

  let nav = await utilities.getNav();

  // Fetch the inventory data using the correct model function (getVehicleById)
  const itemData = await invModel.getVehicleById(inv_id);

  // If no data is found for the given inv_id, send a 404 error
  if (!itemData) {
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav
    });
  }

  // Generate the classification select dropdown using the existing utility function
  const classificationOptions = await utilities.getClassifications();

  // Combine make and model for the title
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  // Render the "edit-inventory" view and pass in the necessary data
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName, // Set the title to reflect the make and model of the vehicle
    nav,
    classificationOptions, // Pass the classification select dropdown as "classificationOptions"
    errors: null, // Initialize errors as null for now
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    flashMessage: req.flash("notice"), // Add flash messages here
  });
};

/* ***************************
 * Process Update Inventory Form Submission
 * *************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;
    
    // Log the request data to check what is being passed
    console.log("Received request data for updating inventory:", req.body);

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      const classificationOptions = await utilities.getClassifications();
      req.flash("notice", "Please correct the errors and try again.");
      return res.status(400).render("inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        classificationOptions,
        errors: errors.array(),
        inv_id,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }

    // Use getVehicleById to check if the vehicle exists
    const vehicle = await invModel.getVehicleById(inv_id);

    // If the vehicle doesn't exist, return a 404 error
    if (!vehicle) {
      req.flash("notice", "Vehicle not found.");
      return res.status(404).redirect("/inv");
    }

    // Update inventory item
    const updateResult = await invModel.updateInventoryItem(
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    );

    if (updateResult) {
      req.flash("notice", "The vehicle has been updated successfully.");
      return res.redirect("/inv"); // Redirect to inventory management page
    } else {
      req.flash("notice", "Error updating vehicle. Please try again.");
      return res.redirect(`/inv/edit/${inv_id}`); // Redirect back to edit page if update fails
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Build Delete Confirmation View
 * *************************** */
invCont.deleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // Collect inventory ID from the URL
  if (isNaN(inv_id)) {
    console.log("Invalid inv_id:", req.params.inv_id); // Log for debugging
    return res.status(400).send("Invalid vehicle ID");
  }

  let nav = await utilities.getNav();

  // Fetch the inventory data using the inv_id from the database
  const itemData = await invModel.getVehicleById(inv_id);

  // If no data is found for the given inv_id, send a 404 error
  if (!itemData) {
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav
    });
  }

  // Generate a name variable for the inventory item's make and model
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  // Render the "delete-confirm" view and pass in the necessary data
  res.render("inventory/delete-confirm", {
    title: `Delete ${itemName}`, // The title should reflect the vehicle being deleted
    nav,
    errors: null, // No errors initially
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    flashMessage: req.flash("notice"),
  });
};

/* ***************************
 * Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = req.body.inv_id; // Get the inv_id from the request body

  try {
    const deleteResult = await invModel.deleteInventoryItem(inv_id); // Use the model to delete the item

    if (deleteResult) {
      req.flash("notice", "The vehicle was successfully deleted.");
      return res.redirect("/inv"); // Redirect to inventory management page after successful deletion
    } else {
      req.flash("notice", "Error deleting vehicle. Please try again.");
      return res.redirect(`/inv/vehicle/${inv_id}`); // Redirect back to the vehicle details page if deletion fails
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Show Add Classification Form
 * *************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flashMessage: req.flash("notice") || null,  // Display flash message if exists
      errors: null,  // No errors initially
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Add New Classification
 * *************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  // Simple validation (ensure no special characters or spaces)
  if (!/^[A-Za-z0-9]+$/.test(classification_name)) {
    req.flash("notice", "The classification name must only contain letters and numbers.");
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      flashMessage: req.flash("notice"),
      errors: [{ msg: "Invalid classification name." }],
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);  // Insert into database

    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully!`);
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add classification.");
      return res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav: await utilities.getNav(),
        errors: [{ msg: "Something went wrong. Please try again." }],
      });
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Build Add Inventory View
 * *************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationOptions = await utilities.getClassifications();

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationOptions,
      errors: null,  // No initial errors
      classification_id: req.body.classification_id || '',
      inv_make: req.body.inv_make || '',
      inv_model: req.body.inv_model || '',
      inv_year: req.body.inv_year || '',
      inv_description: req.body.inv_description || '',
      inv_image: req.body.inv_image || '/images/vehicles/no-image.png',
      inv_thumbnail: req.body.inv_thumbnail || '/images/vehicles/no-image-tn.png',
      inv_price: req.body.inv_price || '',
      inv_miles: req.body.inv_miles || '',
      inv_color: req.body.inv_color || '',
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Process Add Inventory Form Submission
 * *************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const errors = validationResult(req);  // Get validation errors
    if (!errors.isEmpty()) {
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: errors.array(),
        classificationOptions: await utilities.getClassifications(),
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }

    const result = await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result) {
      req.flash("notice", "Vehicle successfully added.");
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.");
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationOptions: await utilities.getClassifications(),
        errors: null,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Build inventory by classification view
 * *************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 * Build Vehicle Detail View (with Reviews)
 * *************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;

  // Fetch vehicle data
  const vehicle = await invModel.getVehicleById(inv_id);

  // Fetch reviews for this vehicle
  const reviews = await invModel.getReviewById(inv_id);

  if (!vehicle) {
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
    });
  }

  const nav = await utilities.getNav();
  res.render("./inventory/vehicle", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle,
    reviews: reviews,  // Pass reviews to the view
    loggedIn: req.session.loggedin || false, // Check if the user is logged in
    user: req.session.user || null, // Fetch user data from session
  });
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Update Review
 * ************************** */
invCont.updateReview = async function (req, res, next) {
  const { review_text, inv_id, account_id } = req.body;  // Get review text, inventory ID, and account ID from the form
  const review_id = req.params.review_id;  // Get review ID from URL
  
  try {
    // Validation: Ensure review_text is not empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("notice", "Please ensure the review text is not empty.");
      return res.status(400).render("reviews/review-update", {
        title: "Update Review",
        flashMessage: req.flash("notice"),
        errors: errors.array(),
        review_id,
        review_text,
        inv_id,
        account_id,
      });
    }

    // Get the review by ID to ensure it belongs to the correct user
    const review = await invModel.getReviewById(review_id);

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("/account");  // Redirect if the review doesn't exist
    }

    // Check if the logged-in user is the author of the review
    if (review.account_id !== account_id) {
      req.flash("notice", "You can only update your own reviews.");
      return res.redirect("/account");
    }

    // Update the review text in the database
    const updateResult = await invModel.updateReview(review_id, review_text);
    
    if (updateResult) {
      req.flash("notice", "Your review has been updated successfully.");
      return res.redirect(`/inv/vehicle/${inv_id}`);  // Redirect to the vehicle's detail page
    } else {
      req.flash("notice", "Error updating the review. Please try again.");
      return res.redirect(`/review/update/${review_id}`);  // Redirect back to the update page if there's an error
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Get a Review by ID (Helper function)
 * ************************** */
invCont.getReviewById = async function (review_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.reviews WHERE review_id = $1`,
      [review_id]
    );
    return data.rows[0]; // Return the first (and only) result
  } catch (error) {
    console.error("Error in getReviewById:", error);
    return null;  // Return null if there's an error
  }
};

/* ***************************
 * Add Review
 * *************************** */
invCont.addReview = async function (req, res, next) {
  const { review_text, inv_id, account_id } = req.body;  // Only the necessary fields are passed
  try {
    // Ensure the review text is not empty
    if (!review_text || review_text.trim() === "") {
      req.flash("notice", "Review text cannot be empty.");
      return res.redirect(`/inv/vehicle/${inv_id}`);
    }

    // Add the review to the database
    const newReview = await invModel.addReview({
      review_text,
      inv_id,
      account_id,  // Only pass the account_id and inv_id
    });

    // If the review was successfully added, redirect to the vehicle page
    if (newReview) {
      req.flash("notice", "Thank you for your review!");
      return res.redirect(`/inv/vehicle/${inv_id}`); // Redirect to the vehicle detail page
    } else {
      req.flash("notice", "Error adding your review. Please try again.");
      return res.redirect(`/inv/vehicle/${inv_id}`);
    }
  } catch (err) {
    next(err);
  }
};



/* ***************************
 * Update Review in Database
 * ************************** */
invCont.updateReviewInDb = async function (review_id, review_text) {
  try {
    const sql = `
      UPDATE public.reviews
      SET review_text = $1
      WHERE review_id = $2
      RETURNING *`;
    const result = await pool.query(sql, [review_text, review_id]);
    return result.rowCount > 0;  // If a row was updated, return true
  } catch (error) {
    console.error("Error updating review:", error);
    return false;  // Return false if there's an error
  }
};




module.exports = invCont;