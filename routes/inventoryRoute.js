const express = require("express");
const invController = require("../controllers/invController");
const router = express.Router();

/* ***************************
 * Inventory Routes
 * *************************** */

// Route to view inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to view a specific vehicle's details
router.get("/vehicle/:inv_id", invController.buildVehicleDetail);

// Intentional Error Route
router.get("/trigger-error", (req, res, next) => {
    const error = new Error("This is an intentional 500 error!");
    error.status = 500;  // Set the status code to 500
    next(error);  // Pass the error to the error-handling middleware
  });
  
module.exports = router;