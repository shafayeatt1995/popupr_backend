const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    transactionID: { type: String, required: true },
    paymentDetails: { type: Object },
    package: { type: String, required: true },
    amount: { type: Number, required: true },
    refunded: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
