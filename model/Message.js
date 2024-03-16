const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: { type: String, ref: 'User' }, // References 'User' collection, sender's identifier
    receiverId: { type: String, ref: 'User' }, // References 'User' collection, receiver's identifier
    text: String, // The content of the message
    timestamp: { type: Date, default: Date.now }, // The time when the message was sent, defaults to the current time
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
