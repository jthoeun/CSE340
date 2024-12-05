const express = require("express");
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const inventoryValidate = require("../utilities/inventory-validation");
const classificationValidate = require("../utilities/classification-validation"); 
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
  classificationValidate.classificationValidationRules(),
  classificationValidate.checkClassificationData, 
  utilities.handleErrors(invController.addClassification)
);

// Route to add new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  inventoryValidate.inventoryValidationRules(),
  inventoryValidate.checkInventoryData, 
  utilities.handleErrors(invController.addInventory)
);

// Intentional Error Route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is an intentional 500 error!");
  error.status = 500;
  next(error);
});

// JavaScript Route to return inventory based on classification ID
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;