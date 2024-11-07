const express = require("express");
const {
  fetchDomain,
  addDomain,
  fetchSingleDomain,
  updateTimer,
  updateMessage,
  deleteDomain,
} = require("../../controllers/DomainController");
const router = express.Router();

router.get("/", fetchDomain);
router.post("/", addDomain);
router.delete("/", deleteDomain);
router.get("/single", fetchSingleDomain);
router.put("/timer", updateTimer);
router.put("/message", updateMessage);

module.exports = router;
