const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/Customer');


router.post("/customer",  customerController.registerCustomer);

// router.get("/customers",  customerController.);

// router.put("/customer/:id",  customerController.updatecustomer);

// router.put("/customer/Deactivate/:id",  customerController.deactivatecustomer);

// router.delete("/customer/:id",  customerController.deleteState);

module.exports = router;