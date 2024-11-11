const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    transactionID: { type: String, required: true },
    paymentDetails: { type: Object, required: true },
    package: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
