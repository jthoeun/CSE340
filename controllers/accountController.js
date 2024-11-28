const utilities = require("../utilities");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav();
        res.render("account/login", {
            title: "Login",
            nav,
            errors: null, // Initialize errors as null
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
            errors: null, // Initialize errors as null
            flashMessage: req.flash ? req.flash("info") : null,
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

        // Attempt to register the account
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            account_password
        );

        if (regResult) {
            // Registration successful
            req.flash(
                "notice",
                `Congratulations, you're registered, ${account_firstname}. Please log in.`
            );
            res.status(201).render("account/login", {
                title: "Login",
                nav,
                errors: null, 
            });
        } else {
            // Registration failed
            req.flash("notice", "Sorry, the registration failed.");
            res.status(501).render("account/register", {
                title: "Registration",
                nav,
                errors: [{ msg: "Registration failed. Please try again." }], // Add a general error message
            });
        }
    } catch (err) {
        next(err); 
    }
}

module.exports = { buildLogin, buildRegister, registerAccount };