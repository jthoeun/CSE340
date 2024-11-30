const express = require("express");
const invController = require("../controllers/invController");
const utilities = require("../utilities"); 
const regValidate = require("../utilities/account-validation"); 
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
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  regValidate.classificationValidationRules(), 
  regValidate.checkRegData, 
  utilities.handleErrors(invController.addClassification)
);

// Route to add new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  regValidate.inventoryValidationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(invController.addInventory)
);

// Intentional Error Route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is an intentional 500 error!");
  error.status = 500; 
  next(error); 
});

module.exports = router;