const { parseError, sendError } = require("../utils");
const { Environment, Paddle } = require("@paddle/paddle-node-sdk");

const controller = {
  async generatePaymentUrl(req, res) {
    try {
      const paddle = new Paddle(process.env.PADDLE_API_KEY, {
        environment: Environment.sandbox,
        logLevel: "verbose",
      });

      const { _id, email } = req.user;
      const { productID } = req.body;

      const product = await paddle.products.get(productID);

      if (product && product.status === "active") {
        const prices = [
          {
            productID: "pro_01jc02z8mq6tg0pjby94xb1ewd",
            priceID: "pri_01jc030me2qnyrjqe1b0v1ppsn	",
            name: "main",
          },
          {
            productID: "pro_01jbzyy1werp4r2kyq99kftwr6",
            priceID: "pri_01jbzz22kv0q1aacz3tdpvqhb1	",
            name: "basic",
          },
        ];
        const priceData = prices.find((val) => val.productID === productID);
        return res.json({ priceData: priceData || false });
      } else {
        sendError({ toast: "Something wrong" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
};

module.exports = controller;
