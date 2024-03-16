const express = require('express');
const Message = require('../model/Message'); // Path to your Message model
const router = express.Router();

// Post a new message
router.post('/:userID/messages', async (req, res) => {
    const { senderId, receiverId, text } = req.body;
    console.log(`Received message to post from ${senderId} to ${receiverId}`, req.body); // Log the message details

    try {
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();
        console.log('Message saved:', newMessage); // Log the saved message
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error); // Log any errors
        res.status(500).send('Internal server error');
    }
});

// Existing backend route for fetching messages
router.get('/messages', async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { $and: [{ senderId }, { receiverId }] },
                { $and: [{ senderId: receiverId }, { receiverId: senderId }] }
            ]
        }).sort('timestamp');

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
