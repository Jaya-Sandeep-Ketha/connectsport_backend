// models/Notification.js
const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//     userId: { type: String, ref: 'User', required: true },
//     type: { type: String, required: true }, // Types: 'friend_request', 'message', 'post', 'group_message'
//     createdAt: { type: Date, default: Date.now },
// });

const notificationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
  }, { timestamps: true });
  
module.exports = mongoose.model('Notification', notificationSchema);
