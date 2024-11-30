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
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flashMessage: req.flash("notice") || null,
    });
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
      flashMessage: req.flash("notice") || null,
      errors: null,
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
    const result = await invModel.addClassification(classification_name);

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
      errors: null,
      inv_make: req.body.inv_make || '',
      inv_model: req.body.inv_model || '',
      inv_year: req.body.inv_year || '',
      inv_description: req.body.inv_description || '',
      inv_image: req.body.inv_image || '',
      inv_thumbnail: req.body.inv_thumbnail || '',
      inv_price: req.body.inv_price || '',
      inv_miles: req.body.inv_miles || '',
      inv_color: req.body.inv_color || '',
      inv_classification_id: req.body.classification_id || '',  // Ensure this is passed
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

    // Get validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: errors.array(),
        classificationOptions: await utilities.getClassifications(),
        inv_classification_id: classification_id,
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
        inv_classification_id: classification_id,
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
 * Build vehicle detail view
 * *************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;  // Retrieve the vehicle ID from the URL

  const vehicle = await invModel.getVehicleById(inv_id);
  
  if (!vehicle) {
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
    });
  }
  
  let nav = await utilities.getNav();
  res.render("./inventory/vehicle", { 
    title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
    nav,
    vehicle,  
  });
};

module.exports = invCont;