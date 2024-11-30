const bcrypt = require("bcryptjs");
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

        // Hash the password before storing
        let hashedPassword;
        try {
            // Regular password and cost (salt is generated automatically)
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
            // Registration successful
            req.flash(
                "notice",
                `Congratulations, ${account_firstname}! Your account has been successfully created. Please log in.`
            );
            return res.redirect("/account/login"); // Redirect to login page
        } else {
            // Registration failed
            req.flash("notice", "Sorry, the registration failed.");
            return res.status(501).render("account/register", {
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