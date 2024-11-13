const { parseError, sendError, message } = require("../utils");

const controller = {
  async generatePaymentUrl(req, res) {
    try {
      const { productName } = req.body;
      if (productName) {
        const package = {};
        const {
          PADDLE_PRICE_APPETIZER,
          PADDLE_PRICE_MAIN_COURSE,
          PADDLE_DISCOUNT_APPETIZER,
          PADDLE_DISCOUNT_MAIN_COURSE,
          LEMON_APPETIZER,
          LEMON_MAIN_COURSE,
          LEMON_APPETIZER_DISCOUNT,
          LEMON_MAIN_COURSE_DISCOUNT,
        } = process.env;

        if (productName === "main_course") {
          // package.priceID = PADDLE_PRICE_MAIN_COURSE;
          // package.discountID = PADDLE_DISCOUNT_MAIN_COURSE;
          package.popupr_pac = "main_course";
          package.url = LEMON_MAIN_COURSE;
          package.discountCode = LEMON_MAIN_COURSE_DISCOUNT;
        } else {
          // package.priceID = PADDLE_PRICE_APPETIZER;
          // package.discountID = PADDLE_DISCOUNT_APPETIZER;
          package.popupr_pac = "appetizer";
          package.url = LEMON_APPETIZER;
          package.discountCode = LEMON_APPETIZER_DISCOUNT;
        }
        return res.json(package);
      } else {
        sendError({ toast: message });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
};

module.exports = controller;
