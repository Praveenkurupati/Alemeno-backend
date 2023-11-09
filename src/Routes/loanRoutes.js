const express = require('express');
const router = express.Router();
const loanController = require('../Controllers/loanController');


router.post("/loan",  loanController.createLoan);

router.get("/loan/:loanId",  loanController.viewLoan);
router.get("/viewStatement/:customer_id/:loan_id",  loanController.viewStatement);

router.get("/checkEligibility",  loanController.checkEligibility);

router.put("/makePayment/:customer_id/:loan_id",  loanController.makePayment);


module.exports = router;