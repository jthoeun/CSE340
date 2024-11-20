// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for displaying details of a specific vehicle by ID
router.get("/vehicle/:inv_id", invController.buildVehicleDetail);

module.exports = router;