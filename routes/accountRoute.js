const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

/* ***************************
 * Account Routes
 * *************************** */

// Route for account management page (default route)
router.get(
  "/",
  utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement)
);

// Route for login page
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

/* ***************************
 * Registration Routes
 * *************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

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

module.exports = router;