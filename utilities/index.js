const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  // Get classifications from the model
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  
  // Loop through the classifications and create the nav list
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
    list += "</li>";
  });
  
  list += "</ul>";
  return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = Util



/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    
    // Loop through each vehicle and build the grid item
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += `<a href="../../inv/vehicle/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
      grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />`;
      grid += "</a>";
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += `<h2><a href="../../inv/vehicle/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
      grid += `${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`;
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  
  return grid;
};

/* **************************************
 * Build Vehicle Detail View HTML
 * ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  let detail = `<h1>${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}</h1>`;
  detail += `<div class="vehicle-image"><img src="/images/vehicles/${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}"></div>`;
  detail += `<div class="vehicle-info">`;
  detail += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
  detail += `<p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_mileage)} miles</p>`;
  detail += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;
  detail += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;  // Add color detail
  detail += "</div>";

  return detail;
};

module.exports = Util;