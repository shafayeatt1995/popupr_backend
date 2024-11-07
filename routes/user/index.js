const express = require("express");
const { generatePaymentUrl } = require("../../controllers/PaymentController");
const router = express.Router();

router.use("/domain", require("./domain"));
// router.use("/code", require("./code"));
router.post("/generate-payment-url", generatePaymentUrl);

module.exports = router;
