const express = require("express");
const mongoose = require("mongoose");
const { lemonMiddleware } = require("../../middleware/lemon");
const { isDev } = require("../../utils");
const { Subscription, User } = require("../../models");
const app = express();

app.post(
  "/popupr-purchase",
  express.raw({ type: "application/json" }),
  lemonMiddleware,
  async (req, res) => {
    console.log("ami anik");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { data, meta } = req?.parseSignature;
      const { event_name, custom_data } = meta;

      if (custom_data && event_name === "order_created") {
        const { userID, popuprPac } = custom_data;
        console.log(meta);
        const { status, user_name, user_email, order_number, total_usd } =
          data.attributes;
        const methodDetails = { status, user_name, user_email };
        await Promise.all(
          await Subscription.create(
            [
              {
                userID,
                transactionID: order_number,
                paymentDetails: methodDetails,
                package: popuprPac,
                amount: total_usd / 100,
              },
            ],
            { session }
          ),
          await User.updateOne(
            { _id: userID },
            {
              power:
                popuprPac === "main_course"
                  ? 20
                  : popuprPac === "appetizer"
                  ? 10
                  : 1,
            },
            { session }
          )
        );
      }

      await session.commitTransaction();
      await session.endSession();

      return res.send("Processed webhook event");
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      await session.endSession();
      return res.status(500).send("Failed to processed webhook event");
    }
  }
);

module.exports = app;
