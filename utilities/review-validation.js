const { body, validationResult } = require("express-validator");

const reviewValidate = {};

// Validation rules for adding a review (for new reviews)
reviewValidate.reviewValidationRules = () => {
  return [
    // Review text validation: not empty and must be a string with a minimum length
    body("review_text")
      .isString()
      .withMessage("Review text must be a valid string.")
      .isLength({ min: 1 })
      .withMessage("Review text cannot be empty."),
  ];
};

// Validation rules for updating a review (only validate the review text)
reviewValidate.updateReviewValidationRules = () => {
  return [
    // Ensure review text is not empty for updates
    body("review_text")
      .isString()
      .withMessage("Review text must be a valid string.")
      .isLength({ min: 1 })
      .withMessage("Review text cannot be empty."),
  ];
};

// Check if validation errors exist for review submission or update
reviewValidate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // If validation errors exist, render the form again with the errors
    req.flash("notice", "There were errors in your review submission.");
    
    try {
      // Fetch the vehicle details to render the form again with the necessary data
      const vehicle = await invModel.getVehicleById(req.body.inv_id);  // Fetch the vehicle by inv_id

      return res.status(400).render("inventory/vehicle", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`, // Pass the vehicle's title to the template
        vehicle, // Pass the vehicle details to the template
        errors: errors.array(),
        flashMessage: req.flash("notice"),
        loggedIn: req.session.loggedin || false, // Pass login status
        user: req.session.user || null, // Pass user data if available
      });
    } catch (err) {
      next(err);
    }
  }
  
  // Proceed to the next middleware if no validation errors
  next();
};

module.exports = reviewValidate;