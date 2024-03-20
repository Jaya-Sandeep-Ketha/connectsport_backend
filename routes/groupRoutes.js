const express = require('express');
const Group = require('../model/group');
const Message = require('../model/Message');
const router = express.Router();

// Fetch all groups the current user is a part of
// Fetch all groups the current user is a part of
router.get('/groups/:currentUser', async (req, res) => {
    const currentUser = req.params.currentUser;

    try {
        const groups = await Group.find({ members: currentUser });
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups for current user:', error);
        res.status(500).send('Internal server error');
    }
});

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

// Fetch members of a group by group name
router.get('/groups/:groupId/members', async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findOne({ name: groupId });
        if (!group) {
            return res.status(404).send('Group not found');
        }

        // Assuming the 'members' field in your group document is an array of user IDs
        // Here, we directly return this array. If you need to fetch user details, additional steps are required.
        res.json(group.members);
    } catch (error) {
        console.error('Error fetching group members by name:', error);
        res.status(500).send('Internal server error');
    }
});


// Adjusted to use POST for adding a user to a group, matching frontend expectations
router.post('/groups/:groupId/addMember', async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }

        if (group.members.includes(userId)) {
            return res.status(400).send('User already a member of the group');
        }

        group.members.push(userId);
        await group.save();
        res.json(group);
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).send('Internal server error');
    }
});

// Adjusted to use POST for removing a user from a group, matching frontend expectations
router.post('/groups/:groupId/removeMember', async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }

        if (!group.members.includes(userId)) {
            return res.status(400).send('User not a member of the group');
        }

        group.members = group.members.filter(member => member !== userId);
        await group.save();
        res.json(group);
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
