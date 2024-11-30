const express = require("express");
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const inventoryValidate = require("../utilities/inventory-validation"); // Keep inventory validation as is
const classificationValidate = require("../utilities/classification-validation"); // Import the new classification validation
const router = express.Router();

/* ***************************
 * Inventory Routes
 * *************************** */

// Route to Inventory Management Page
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to view inventory by classification
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to view a specific vehicle's details
router.get("/vehicle/:inv_id", utilities.handleErrors(invController.buildVehicleDetail));

// Route to add new classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification)); // Show form
router.post(
  "/add-classification",
  classificationValidate.classificationValidationRules(), // Use the new classification validation rules
  classificationValidate.checkClassificationData,          // Check classification data
  utilities.handleErrors(invController.addClassification) // Handle classification form submission
);

// Route to add new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  inventoryValidate.inventoryValidationRules(), // Continue using inventory validation for inventory routes
  inventoryValidate.checkInventoryData, 
  utilities.handleErrors(invController.addInventory)
);

// Intentional Error Route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is an intentional 500 error!");
  error.status = 500; // Set the status code to 500
  next(error); // Pass the error to the error-handling middleware
});

module.exports = router;