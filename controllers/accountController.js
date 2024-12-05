const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      flashMessage: req.flash("notice") || null,
    });
  } catch (err) {
    next(err); // Pass errors to the error-handling middleware
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      flashMessage: req.flash("notice") || null,
    });
  } catch (err) {
    next(err); // Pass errors to the error-handling middleware
  }
}

/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/manage", {
      title: "Account Management",
      nav,
      flashMessage: req.flash("notice") || null,
      errors: null,
    });
  } catch (err) {
    next(err); // Pass errors to the error-handling middleware
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the registration.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }

    // Attempt to register the account
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, ${account_firstname}! Your account has been successfully created. Please log in.`
      );
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: [{ msg: "Registration failed. Please try again." }],
      });
    }
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
};