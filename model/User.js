const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Define user schema and model;
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    email: { type: String, unique: true },
    userId: { type: String, unique: true },
    password: String,
    favoriteSports: [String],
    termsAgreed: Boolean,
    securityQuestions: [
      {
        question: String,
        answer: String
      }
    ],
    bio: { type: String, default: '' },
    emailPublic: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: {
      type: String,
      default: null
    },
  },
  { collection: "users"}
  );
  // Hash password before saving
userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, saltRounds, function(err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});



module.exports = mongoose.model("users", userSchema);