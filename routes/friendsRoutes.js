const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Network = require('../model/Network'); // Adjust the path as necessary
const User = require('../model/User'); 

// Combine route and controller logic

// Fetch friend requests received by a user
router.get('/friend-requests', async (req, res) => {
    try {
        const network = await Network.findOne({ userId: req.user.userId }).populate('reqReceived');
        res.json(network ? network.reqReceived : []);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching friend requests', error: error });
    }
});

router.get('/people', async (req, res) => {
    console.log('getPeopleYouMayKnow called');
    try {
        // Fetch the userId from query parameters
        const userId = req.query.userId;
        console.log('Fetching network for user:', userId);

        // Validate userId presence
        if (!userId) {
            return res.status(400).json({ message: "UserId query parameter is required." });
        }

        // Fetch the user's details from the User collection
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user exists in the Network collection and add them if not
        let userNetwork = await Network.findOne({ userId: userId });
        if (!userNetwork) {
            console.log('User network not found for:', userId, ', adding to network db.');
            userNetwork = new Network({
                userId: userId,
                friends: [],
                blocked: [],
                reqSent: [],
                reqReceived: []
            });
            await userNetwork.save();
        }

        const excludedUserIds = [
            userId, 
            ...userNetwork.friends, 
            ...userNetwork.blocked, 
            ...userNetwork.reqSent, 
            ...userNetwork.reqReceived
        ];

        console.log('Excluded user IDs:', excludedUserIds);

        // Fetch users excluding the ones in the user's network
        const potentialFriends = await User.find({
            userId: { $nin: excludedUserIds }
        }, 'userId firstName lastName'); // Adjust according to your schema

        console.log('Potential friends found:', potentialFriends);

        // Prepare the response
        const potentialFriendsData = potentialFriends.map(friend => ({
            userId: friend.userId,
            name: `${friend.firstName} ${friend.lastName}`,
            mutualFriends: 0 // Placeholder for mutual friends count
        }));

        res.json(potentialFriendsData);
    } catch (error) {
        console.error('Error in getPeopleYouMayKnow:', error);
        res.status(500).send({ message: 'Error fetching people you may know', error: error });
    }
});

module.exports = router;
