const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  bio: String,
  email: String,
  emailPublic: Boolean,
});

const User = mongoose.model('users', userSchema);

module.exports = User;
