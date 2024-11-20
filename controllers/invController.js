const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
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

  // Fetch the vehicle data from the database
  const vehicle = await invModel.getVehicleById(inv_id);
  
  if (!vehicle) {
    // If no vehicle is found, return a 404 page
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
    });
  }
  
  // Generate the HTML for the vehicle details page
  const vehicleDetailHTML = await utilities.buildVehicleDetail(vehicle);
  
  let nav = await utilities.getNav();
  
  // Render the vehicle detail page with the vehicle's data
  res.render("./inventory/vehicle-detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,  // Dynamic page title
    nav,
    vehicleDetailHTML,  // Pass the vehicle details HTML to the view
  });
};

module.exports = invCont;