const accountModel = require("../models/account-model");
const utilities = require("../utilities");
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
      .withMessage("Please provide a first name."),
    
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
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
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      ...req.body,
    });
    return;
  }
  next();
};

/* **************************************
 * Check Login Data
 ************************************* */
validate.checkLoginData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      ...req.body,
    });
    return;
  }
  next();
};

/* **************************************
 * Account Update Validation Rules
 ************************************* */
validate.updateAccountValidationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("First name is required."),
    
    body("account_lastname")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address."),
  ];
};

/* **************************************
 * Check Account Update Data
 ************************************* */
validate.checkAccountUpdateData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account Information",
      nav,
      ...req.body,
    });
    return;
  }
  next();
};

/* **************************************
 * Password Validation Rules
 ************************************* */
validate.passwordValidationRules = () => {
  return [
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Current password is required."),
    
    body("new_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .withMessage("New password must meet the criteria: at least 8 characters, 1 uppercase, 1 lowercase, 1 number."),
  ];
};

/* **************************************
 * Check Password Data
 ************************************* */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account Information",
      nav,
      ...req.body,
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
 * Check Classification Data
 ************************************* */
validate.checkClassificationData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      ...req.body,
    });
    return;
  }
  next();
};

module.exports = validate;