const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const invModel = require("../models/inventory-model"); // Added this for fetching reviews
const jwt = require("jsonwebtoken");
const pool = require("../database");
const { updateReview, deleteReview } = require("./invController");
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
    const accountData = res.locals.accountData;  // Use the account data from res.locals
    
    // Fetch reviews related to the logged-in user
    const reviews = await invModel.getReviewsByAccountId(accountData.account_id);  // Fetch reviews from the model

    res.render("account/manage", {
      title: "Account Management",
      nav,
      flashMessage: req.flash("notice") || null,
      errors: null,
      accountData, // Pass user data to the view
      reviews: reviews || [],  // Pass the reviews array to the view, if any
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Account Registration Process
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
 *  Account Update View (GET)
 * *************************************** */
async function buildUpdate(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const account_id = req.params.account_id;
    const accountData = await accountModel.getAccountById(account_id); // Get account data using the account_id

    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.status(404).redirect("/account/");
    }

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      account: accountData,
      flashMessage: req.flash("notice") || null,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process Account Update (POST)
 * *************************************** */
async function updateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    // Check if the email is being changed
    const accountData = await accountModel.getAccountById(account_id);
    if (account_email !== accountData.account_email) {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        req.flash("notice", "Email address is already taken.");
        return res.status(400).render("account/update", {
          title: "Update Account Information",
          nav: await utilities.getNav(),
          account_firstname,
          account_lastname,
          account_email,
          account_id,
          flashMessage: req.flash("notice"),
          errors: [{ msg: "Email already taken." }],
        });
      }
    }

    // Update account info in the database
    const result = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);

    if (result) {
      req.flash("notice", "Your account information has been updated successfully.");

      // Fetch the updated data
      const updatedAccountData = await accountModel.getAccountById(account_id);

      // Update res.locals.accountData for rendering the updated page
      res.locals.accountData = updatedAccountData;

      // Redirect back to the update page with the updated information
      return res.redirect(`/account/update/${account_id}`);
    } else {
      req.flash("notice", "There was an issue updating your account. Please try again.");
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Failed to update account." }],
      });
    }
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process Password Change (POST)
 * *************************************** */
async function updatePassword(req, res, next) {
  try {
    const { current_password, new_password, account_id } = req.body;

    // Fetch account details
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.status(404).redirect("/account/");
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(current_password, accountData.account_password);
    if (!isMatch) {
      req.flash("notice", "Current password is incorrect.");
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Incorrect current password." }],
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
      });
    }

    // Validate the new password
    if (new_password.length < 8) {
      req.flash("notice", "Password must be at least 8 characters long.");
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Password must be at least 8 characters long." }],
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "Your password has been updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "There was an issue updating your password. Please try again.");
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
        errors: [{ msg: "Failed to update password." }],
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
      const accessToken = jwt.sign({ ...accountData, firstName: accountData.account_firstname }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

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
/* ***************************
 * Update Review Form
 * *************************** */
async function buildReviewUpdateForm(req, res, next) {
  const review_id = req.params.review_id;
  try {
    const sql = `
      SELECT r.review_text, r.inv_id, a.account_firstname
      FROM public.reviews AS r
      JOIN public.account AS a ON r.account_id = a.account_id
      WHERE r.review_id = $1;`;
    const data = await pool.query(sql, [review_id]);
    const review = data.rows[0]; // Get the first row (if it exists)

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("/account"); // Redirect if review doesn't exist
    }
    const nav = await utilities.getNav();

    res.render("account/review/review-update", {
      title: "Update Review",
      review,
      flashMessage: req.flash("notice"),
      errors: req.flash("errors") ||[],
      nav,
    });
  } catch (err) {
    next(err); // Pass any errors to the error handler
  }
}
/* ***************************
 * Process Review Update
 * *************************** */
async function processReviewUpdate(req, res, next) {
  const { review_text } = req.body; // Get review text from form
  const review_id = req.params.review_id; // Get the review ID from URL

  try {
    // Validate the review text (optional if already handled in middleware)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("notice", "Review text cannot be empty.");
      return res.redirect(`/account/review/update/${review_id}`); // Ensure the URL is correct
    }

    // Perform the update in the database
    const updatedReview = await invModel.updateReview(review_id, review_text);

    if (updatedReview) {
      req.flash("notice", "Your review has been updated.");
      return res.redirect("/account"); // Redirect back to account management page after a successful update
    } else {
      req.flash("notice", "Error updating the review.");
      return res.redirect(`/account/review/update/${review_id}`); // If error, redirect back to the update page
    }
  } catch (err) {
    next(err);
  }
};
/* ***************************
 * Build Delete Review Confirmation Form
 * *************************** */
async function buildReviewDeleteForm(req, res, next) {
  const review_id = req.params.review_id; // Get review ID from URL
  try {
    const review = await invModel.getReviewById(review_id); // Fetch review data
    if (!review) {
      req.flash("notice", "Review not found.");
      return res.status(404).redirect("/account");
    }
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only delete your own reviews.");
      return res.redirect("/account");
    }
    res.render("account/review/review-delete", {
      title: "Delete Review",
      review,
      flashMessage: req.flash("notice"),
    });
  } catch (err) {
    console.error("Error in buildReviewDeleteForm:", err);
    next(err);
  }
}

/* ***************************
 * Process Review Deletion
 * *************************** */
async function processReviewDelete(req, res, next) {
  const review_id = req.params.review_id; // Get review ID from URL
  const account_id = res.locals.accountData.account_id; // Get the account ID of the logged-in user

  try {
    // Fetch the review by ID
    const review = await invModel.getReviewById(review_id);

    // Ensure the logged-in user owns this review
    if (review.account_id !== account_id) {
      req.flash("notice", "You can only delete your own reviews.");
      return res.redirect("/account"); // Redirect if the user doesn't own the review
    }

    const deleteResult = await invModel.deleteReview(review_id); // Delete the review from the database

    if (deleteResult) {
      req.flash("notice", "Your review has been deleted.");
      return res.redirect("/account"); // Redirect back to account management page after deletion
    } else {
      req.flash("notice", "Error deleting the review.");
      return res.redirect(`/review/delete/${review_id}`); // If error, redirect to delete page
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  updatePassword,
  buildUpdate,
  updateAccount,
  processReviewUpdate,
  processReviewDelete,
  buildReviewUpdateForm,
  buildReviewDeleteForm
};