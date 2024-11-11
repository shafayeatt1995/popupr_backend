const { parseError, sendError, message } = require("../utils");

const controller = {
  async generatePaymentUrl(req, res) {
    try {
      const { productName } = req.body;
      if (productName) {
        const {
          PADDLE_PRICE_APPETIZER,
          PADDLE_PRICE_MAIN_COURSE,
          PADDLE_DISCOUNT_APPETIZER,
          PADDLE_DISCOUNT_MAIN_COURSE,
        } = process.env;

        let priceID;
        let discountID;
        if (productName === "main_course") {
          priceID = PADDLE_PRICE_MAIN_COURSE;
          discountID = PADDLE_DISCOUNT_MAIN_COURSE;
          popupr_pac = "main_course";
        } else {
          priceID = PADDLE_PRICE_APPETIZER;
          discountID = PADDLE_DISCOUNT_APPETIZER;
          popupr_pac = "appetizer";
        }
        return res.json({ priceID, discountID, popupr_pac });
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
