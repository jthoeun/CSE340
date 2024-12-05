const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();  // Fetch classifications from the database
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    
    // Loop through classifications and create the navigation list
    data.rows.forEach((row) => {
      list += "<li>";
      list +=
        `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw new Error("Unable to fetch classifications");
  }
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* *******************************
 * Get Classifications from DB
 ******************************* */
Util.getClassifications = async function () {
  try {
    const result = await invModel.getClassifications();  // Query the classifications from the database
    return result.rows;  // Return the rows of classification data
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw new Error("Unable to fetch classifications");
  }
};

/* **************************************
 * Build the classification view HTML
 ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += `<a href="/inv/vehicle/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
      grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />`;
      grid += "</a>";
      grid += '<div class="namePrice">';
      grid += `<h2><a href="/inv/vehicle/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
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
 ************************************ */
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

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util;