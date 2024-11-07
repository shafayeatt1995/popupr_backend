const { check } = require("express-validator");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

const validate = {
  loginValidation: [
    check("email")
      .trim()
      .custom(async (value, { req }) => {
        try {
          const { id, provider } = req.body;
          const user = await User.findOne({ email: value }).select(
            "+password +power +suspended +deleted"
          );
          if (user) {
            const password =
              provider === "google" || provider === "facebook"
                ? id + process.env.SOCIAL_LOGIN_PASS
                : req.body.password;
            const check = await bcrypt.compare(password, user.password);
            if (check) {
              if (user.suspended) {
                throw new Error(`Account suspended`);
              } else {
                if (user.deleted) {
                  throw new Error(`Account deleted`);
                } else {
                  req.user = user;
                }
              }
            } else {
              throw new Error(
                provider
                  ? `This email already used, Try another account`
                  : `Login failed. Invalid credentials.`
              );
            }
          } else {
            throw new Error(`Login failed. Invalid credentials.`);
          }
          return true;
        } catch (err) {
          throw new Error(err.message);
        }
      }),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
};

module.exports = validate;
