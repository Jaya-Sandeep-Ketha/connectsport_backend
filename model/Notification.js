// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String, default: '' },
  }, { timestamps: true });
  
module.exports = mongoose.model('Notification', notificationSchema);
