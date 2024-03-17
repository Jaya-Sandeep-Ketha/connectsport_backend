const express = require('express');
const Group = require('../model/group');
const Message = require('../model/Message');
const router = express.Router();

// Create a new group
router.post('/groups', async (req, res) => {
    const { name, members } = req.body;
    try {
        const newGroup = new Group({ name, members });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating new group:', error);
        res.status(500).send('Internal server error');
    }
});

// Add a user to a group
router.patch('/groups/:groupName/addUser', async (req, res) => {
    const { groupName } = req.params;
    const { userId } = req.body;

    try {
        const updatedGroup = await Group.findOneAndUpdate(
            { name: groupName },
            { $addToSet: { members: userId } },
            { new: true }
        );
        res.json(updatedGroup);
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).send('Internal server error');
    }
});

// Remove a user from a group
router.patch('/groups/:groupName/removeUser', async (req, res) => {
    const { groupName } = req.params;
    const { userId } = req.body;

    try {
        const updatedGroup = await Group.findOneAndUpdate(
            { name: groupName },
            { $pull: { members: userId } },
            { new: true }
        );
        res.json(updatedGroup);
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).send('Internal server error');
    }
});

// Post a new message to a group
router.post('/groups/:groupId/messages', async (req, res) => {
    const { senderId, text } = req.body;
    const { groupId } = req.params;

    try {
        const newMessage = new Message({
            senderId,
            text,
            groupId,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error posting message to group:', error);
        res.status(500).send('Internal server error');
    }
});

// Fetch messages from a group
router.get('/groups/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ groupId }).sort('timestamp');
        res.json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
