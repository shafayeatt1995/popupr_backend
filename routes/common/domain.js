const express = require("express");
const { domainMessages } = require("../../controllers/DomainController");
const router = express.Router();

router.get("/domain-messages", domainMessages);

module.exports = router;
