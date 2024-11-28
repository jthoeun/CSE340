const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

/* ***************************
 * Account Routes
 * *************************** */
router.get("/login",utilities.handleErrors(accountController.buildLogin));


/* ***************************
 * Registration Routes
 * *************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister));


/* ***************************
 * Processing Account Routes
 * *************************** */
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )
module.exports = router;