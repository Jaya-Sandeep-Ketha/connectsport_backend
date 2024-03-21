const Network = require('../model/Network'); // Adjust the path as necessary
const User = require('../model/User'); 

// Fetch friend requests received by a user
exports.getFriendRequests = async (req, res) => {
    try {
        const network = await Network.findOne({ userId: req.user.id }).populate('reqReceived');
        res.json(network.reqReceived);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching friend requests', error: error });
    }
};

const User = require('../model/User'); // Ensure correct paths
const Network = require('../model/Network');

exports.getPeopleYouMayKnow = async (req, res) => {
    console.log('getPeopleYouMayKnow called');
    try {
        console.log('Fetching network for user:', req.user.userId);

        // Fetch the user's details from the User collection
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user exists in the Network collection and add them if not
        let userNetwork = await Network.findOne({ userId: req.user.userId });
        if (!userNetwork) {
            console.log('User network not found for:', req.user.userId, ', adding to network db.');
            userNetwork = new Network({
                userId: req.user.userId,
                friends: [],
                blocked: [],
                reqSent: [],
                reqReceived: []
            });
            await userNetwork.save();
        }

        const excludedUserIds = [
            req.user.userId, 
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
};

// Example function to handle sending friend requests
exports.sendFriendRequest = async (req, res) => {
    // Implementation depends on your app logic
    // Update reqSent for requester and reqReceived for recipient
};

// Similarly, implement functions for accepting/rejecting friend requests, and blocking/unblocking users
