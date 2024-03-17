const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: { type: String, ref: 'users' }, // References 'User' collection, sender's identifier
    receiverId: { type: String, ref: 'users' }, // References 'User' collection, receiver's identifier
    groupId: { type: String, ref: 'group' },
    text: String, // The content of the message
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }, // The time when the message was sent, defaults to the current time
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
