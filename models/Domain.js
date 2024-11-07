const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  image: { type: String },
  key: { type: String },
  title: { type: String, default: "" },
  message: { type: String, default: "" },
  time: { type: String, default: "" },
});

const DomainSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    domain: { type: String, required: true, unique: true },
    favicon: { type: String, default: "" },
    start: { type: Number, default: 500 },
    send: { type: Number, default: 1000 },
    hide: { type: Number, default: 5000 },
    messages: { type: [MessageSchema], default: [] },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Domain", DomainSchema);
