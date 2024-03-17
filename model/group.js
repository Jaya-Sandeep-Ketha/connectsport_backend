const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    members: [{ type: String, ref: 'users' }], // Array of user IDs
    createdAt: { type: Date, default: Date.now },
});

const group = mongoose.model('group', groupSchema);

module.exports = group;
