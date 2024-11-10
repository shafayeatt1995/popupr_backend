const express = require("express");
const { isDev, paddle } = require("../utils");
const { Environment, Paddle } = require("@paddle/paddle-node-sdk");
const router = express.Router();

const allowedIps = isDev
  ? [
      "34.194.127.46",
      "54.234.237.108",
      "3.208.120.145",
      "44.226.236.210",
      "44.241.183.62",
      "100.20.172.113",
    ]
  : [
      "34.232.58.13",
      "34.195.105.136",
      "34.237.3.244",
      "35.155.119.135",
      "52.11.166.252",
      "34.212.5.7",
    ];

router.use((req, res, next) => {
  const allow = allowedIps.includes(
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  );
  if (allow) return next();
  console.log("Forbidden: IP not allowed");
  return res.status(403).send("Forbidden: IP not allowed");
});

router.post(
  "/popupr-purchase",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["paddle-signature"] || "";
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;

    try {
      const paddle = new Paddle(process.env.PADDLE_API_KEY, {
        environment: isDev ? Environment.sandbox : Environment.production,
      });

      if (signature && rawRequestBody) {
        const eventData = paddle.webhooks.unmarshal(
          rawRequestBody,
          secretKey,
          signature
        );
        console.log(eventData);
        switch (eventData.eventType) {
          case EventName.ProductUpdated:
            console.log(`Product ${eventData.data.id} was updated`);
            break;
          case EventName.SubscriptionUpdated:
            console.log(`Subscription ${eventData.data.id} was updated`);
            break;
          default:
            console.log(eventData.eventType);
        }
        res.send("Paddle webhook received and verified");
      } else {
        console.log("Signature missing in header");
        res.status(400).send("Bad Request: Signature missing");
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Error handling webhook");
    }
  }
);

module.exports = router;
