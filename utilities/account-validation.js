const accountModel = require("../models/account-model");
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
  * Registration Data Validation Rules
  ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.
    
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email");
        }
      }),
    
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* **************************************
 * Login Data Validation Rules
 ************************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please enter a valid email address."),
    
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};


/* **************************************
 * Check Registration Data
 ************************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **************************************
 * Check Login Data
 ************************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, // Preserves the email field value
    });
    return;
  }
  next();
};

/* **************************************
 * Check Classification Data
 ************************************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name, // Preserve field value
    });
    return;
  }
  next();
};

/* **************************************
 * Check Inventory Data
 ************************************* */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_miles,
    inv_color,
  } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationOptions = await utilities.getClassifications();

    // If errors exist, render the add-inventory page with errors and retain data
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationOptions,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};
/* **************************************
 * Classification Data Validation Rules
 ************************************* */
validate.classificationValidationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers.")
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters long."),
  ];
};

/* **************************************
 * Inventory Data Validation Rules
 ************************************* */
validate.inventoryValidationRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isNumeric()
      .withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number."),
    body("inv_price").isNumeric().notEmpty().withMessage("Price is required."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image URL is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail URL is required."),
    body("inv_miles")
      .isNumeric()
      .withMessage("Miles must be a valid number.")
      .notEmpty()
      .withMessage("Mileage is required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

module.exports = validate;