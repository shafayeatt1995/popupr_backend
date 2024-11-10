const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

router.use("/", require("./common/domain"));
router.use("/auth", require("./auth"));

router.use(isAuthenticated);
router.use("/admin", require("./admin"));
router.use("/user", require("./user"));

module.exports = router;
