const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User' },
  amount: Number,
  donationDate: { type: Date, default: Date.now },
}, { _id: false });

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: Date,
  type: { type: String, required: true, enum: ['Event', 'Organization'] },
  venue: String,
  askForDonations: { type: Boolean, default: false }, // New field for donation request option
  donationMobile: String, // Mobile number for donations
  contactNumber: String, // Mobile number for contact
  createdBy: { type: String, ref: 'User', required: true },
  followers: [{ type: String, ref: 'User' }],
  donors: [donorSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Page', pageSchema);
