const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema({
    userId: { type: String, ref: 'users' }, // Assuming 'User' is the model name
    friends: [{ type: String }],
    blocked: [{ type: String }],
    reqSent: [{ type: String }],
    reqReceived: [{ type: String }],
}, {
    collection: "networks" // Collection names are typically lowercase
});

module.exports = mongoose.model("Network", networkSchema);
