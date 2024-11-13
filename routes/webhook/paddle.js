const express = require("express");
const mongoose = require("mongoose");
const { isDev } = require("../../utils");
const { Paddle, EventName } = require("@paddle/paddle-node-sdk");
const { Subscription, User } = require("../../models");
const app = express();

const paddle = new Paddle(process.env.PADDLE_API_KEY);
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

app.use((req, res, next) => {
  const allow = allowedIps.includes(
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  );
  if (allow) return next();
  return res.status(403).send("Forbidden: IP not allowed");
});

app.post(
  "/popupr-purchase",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const signature = req.headers["paddle-signature"] || "";
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET || "";

    try {
      if (signature && rawRequestBody) {
        const eventData = await paddle.webhooks.unmarshal(
          rawRequestBody,
          secretKey,
          signature
        );
        switch (eventData.eventType) {
          case EventName.TransactionCompleted:
            const { id, status, customData, payments } = eventData?.data;
            if (customData && status === "completed") {
              const { user, popupr_pac } = customData;
              const { amount, methodDetails } = payments[0];
              await Promise.all(
                await Subscription.create(
                  [
                    {
                      userID: user._id,
                      transactionID: id,
                      paymentDetails: methodDetails,
                      package: popupr_pac,
                      amount: amount / 100,
                    },
                  ],
                  { session }
                ),
                await User.updateOne(
                  { _id: user._id },
                  {
                    power:
                      popupr_pac === "main_course"
                        ? 20
                        : popupr_pac === "appetizer"
                        ? 10
                        : 1,
                  },
                  { session }
                )
              );
            }
            break;
          default:
        }
      }
      await session.commitTransaction();
      await session.endSession();
      res.send("Processed webhook event");
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
      await session.endSession();
      res.status(500).send("Failed to processed webhook event");
    }
  }
);

module.exports = app;
