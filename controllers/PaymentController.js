const { parseError, sendError, message, isDev, paddle } = require("../utils");

const controller = {
  async generatePaymentUrl(req, res) {
    try {
      const {
        PADDLE_PRODUCT_ID,
        PADDLE_PRICE_APPETIZER,
        PADDLE_PRICE_MAIN_COURSE,
        PADDLE_DISCOUNT_APPETIZER,
        PADDLE_DISCOUNT_MAIN_COURSE,
      } = process.env;

      const products = await paddle.products.get(PADDLE_PRODUCT_ID);
      if (products && products.status === "active") {
        const { productName } = req.body;
        let priceID;
        let discountID;
        if (productName === "main_course") {
          priceID = PADDLE_PRICE_MAIN_COURSE;
          discountID = PADDLE_DISCOUNT_MAIN_COURSE;
        } else {
          priceID = PADDLE_PRICE_APPETIZER;
          discountID = PADDLE_DISCOUNT_APPETIZER;
        }
        return res.json({ priceID, discountID });
      } else {
        sendError({ toast: message });
      }
      return res.json({ priceData: false });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
};

module.exports = controller;
