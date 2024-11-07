const { validationResult } = require("express-validator");

const validation = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    return res.status(422).json({ errors: mappedErrors });
  }
};

module.exports = { validation };
