const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true, lowercase: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "/images/avatar/1.webp" },
    suspended: { type: Boolean, default: false, select: false },
    deleted: { type: Boolean, default: false, select: false },
    power: { type: Number, default: 1, select: false },
    type: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    socialAccount: { type: Boolean, default: false },
    provider: { type: String },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = bcrypt.hashSync(user.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
