const mongoose = require("mongoose");
// Define user schema and model;
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    email: String,
    userId: String,
    password: String,
    favoriteSports: [String],
    termsAgreed: Boolean,
    securityQuestion1: String,
    securityQuestion2: String,
    securityAnswer1: String,
    securityAnswer2: String,
    otp: String,
  },
  {
    collection: "users",
  });
module.exports = mongoose.model("users", userSchema);