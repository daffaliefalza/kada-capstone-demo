const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImageUrl: { type: String, default: null },
    registerType: { type: String, enum: ["normal", "google"], default: "normal"},
    socialId: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
