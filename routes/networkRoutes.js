const express = require('express');
const Message = require('../model/Message'); // Ensure this path correctly points to your Message model
const Network = require('../model/Network'); // Ensure this path correctly points to your Network model
const router = express.Router();

router.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;

    const getLastMessages = async (userId) => {
        // Your aggregation function remains the same
        return Message.aggregate([
            { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: { $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"] }, lastMessage: { $first: "$$ROOT" } } }
        ]);
    };

    try {
        console.log(`Fetching network information for user ID: ${userId}`);
        const network = await Network.findOne({ userId }).populate('friends');
        console.log('Network:', network);

        if (!network) {
            return res.status(404).send('Network information not found');
        }

        const lastMessages = await getLastMessages(userId);
        console.log('Last messages:', lastMessages);

        const friendsWithLastMessage = network.friends.map(friend => {
            // Ensure 'friend' is treated as an object; remove any '.toObject()' usage if 'friend' is not a Mongoose document
            const friendData = friend; // Assume 'friend' is already a proper object; adjust based on your actual data structure
            console.log(friend);
            const correspondingMessage = lastMessages.find(msg => msg._id === (friendData ? friendData : ''));
            console.log(`Processing friend: ${friendData} with corresponding message:`, correspondingMessage);

            // Correct object construction
            return {
                userId: friendData,
                lastMessage: correspondingMessage ? correspondingMessage.lastMessage : null
            };
        });

        console.log('Friends with last message:', friendsWithLastMessage);
        res.json(friendsWithLastMessage);
    } catch (error) {
        console.error('Error fetching friends for userId:', userId, error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
