const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const { validationResult } = require("express-validator");
const utilities = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
utilities.getNav = async function () {
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
utilities.handleErrors = (fn) => {
  return (req, res, next) => {
    // Ensure the provided argument is actually a function
    if (typeof fn !== 'function') {
      return next(new Error('The provided argument is not a function'));
    }
    // Call the passed function and handle the promise errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/* *******************************
 * Get Classifications from DB
 ******************************* */
utilities.getClassifications = async function () {
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
utilities.buildClassificationGrid = async function (data) {
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
utilities.buildVehicleDetail = async function (vehicle, reviews) {
  let detail = `<h1>${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}</h1>`;
  detail += `<div class="vehicle-image"><img src="/images/vehicles/${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}"></div>`;
  detail += `<div class="vehicle-info">`;
  detail += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
  detail += `<p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>`;
  detail += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;
  detail += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;  // Add color detail
  detail += "</div>";

  // Add reviews section to the detail view
  detail += `<h2>Reviews</h2>`;
  
  if (reviews.length > 0) {
    reviews.forEach(review => {
      detail += `<div class="review">
                    <p><strong>${review.screen_name}</strong></p>
                    <p>${review.review_text}</p>
                    <p><em>Reviewed on: ${new Date(review.review_date).toLocaleDateString()}</em></p>
                 </div>`;
    });
  } else {
    detail += `<p>No reviews yet. Be the first to review this vehicle!</p>`;
  }

  return detail;
};

/* ****************************************
* Middleware to check token validity
**************************************** */
utilities.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          res.locals.loggedin = 0;
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1; 
        next(); 
      });
  } else {
    res.locals.loggedin = 0; 
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
utilities.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
};

module.exports = utilities;