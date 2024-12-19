const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const reviewValidate = require("../utilities/review-validation");

/* ***************************
 * Account Routes
 * *************************** */

// Route for account management page (default route)
router.get(
  "/",
  utilities.checkLogin,  // Ensure the user is logged in
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Route for login page
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

// Logout route to clear the JWT token and redirect to home page
router.get("/logout", (req, res, next) => {
  res.clearCookie("jwt");  // Clear the JWT token cookie
  res.redirect("/");  // Redirect the client to the home page
});

/* ***************************
 * Registration Routes
 * *************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
/* ***************************
 * Account Management Review routes
 * *************************** */
// Route for updating a review (by review ID)
router.get(
  "/review/update/:review_id", 
  utilities.handleErrors(accountController.buildReviewUpdateForm)
);  // Show the update form

router.post(
  "/review/update/:review_id", 
  utilities.handleErrors(accountController.processReviewUpdate)
);  // Process the update

// Route for deleting a review (by review ID)
router.get(
  "/review/delete/:review_id", 
  utilities.handleErrors(accountController.buildReviewDeleteForm)
);  // Show the delete confirmation form

router.post(
  "/review/delete/:review_id", 
  utilities.handleErrors(accountController.processReviewDelete)
);  // Process the deletion


/* ***************************
 * Processing Account Routes
 * *************************** */

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(), 
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.accountLogin)
);

/* ***************************
 * Account Update Routes
 * *************************** */

// Route to account update page
router.get(
  "/update/:account_id",
  utilities.checkLogin,  // Ensure the user is logged in
  utilities.handleErrors(accountController.buildUpdate)
);

// Route to process account update (POST request)
router.post(
  "/update",
  utilities.checkLogin,  // Ensure the user is logged in
  regValidate.updateAccountValidationRules(),  // Validate account update data
  regValidate.checkAccountUpdateData,  // Check for validation errors
  utilities.handleErrors(accountController.updateAccount)
);

// Route to process password change (POST request)
router.post(
  "/update-password",
  utilities.checkLogin,  // Ensure the user is logged in
  regValidate.passwordValidationRules(),  // Validate password change data
  regValidate.checkPasswordData,  // Check for validation errors
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;