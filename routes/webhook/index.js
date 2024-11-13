const express = require("express");
const router = express.Router();

router.use("/paddle", require("./paddle"));
router.use("/lemon", require("./lemon"));

module.exports = router;
