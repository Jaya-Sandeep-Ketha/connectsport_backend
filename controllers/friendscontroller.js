const Network = require('../model/Network');
const User = require('../model/User');

// Define controller methods
exports.getFriendRequests = async (req, res) => {
    try {
        const userId = req.query.userId; // As we're getting userId from query parameters
        const network = await Network.findOne({ userId }).populate('reqReceived');
        res.json(network ? network.reqReceived : []);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching friend requests', error });
    }
};

exports.getPeopleYouMayKnow = async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log('Fetching network for user:', userId);

        let userNetwork = await Network.findOne({ userId });
        if (!userNetwork) {
            console.log('User network not found for:', userId, ', adding to network db.');
            userNetwork = new Network({
                userId,
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

        const potentialFriends = await User.find({ userId: { $nin: excludedUserIds } }, 'userId firstName lastName');

        const potentialFriendsData = potentialFriends.map(friend => ({
            userId: friend.userId,
            name: `${friend.firstName} ${friend.lastName}`,
            mutualFriends: 0 // Placeholder, adjust as needed
        }));

        res.json(potentialFriendsData);
    } catch (error) {
        console.error('Error in getPeopleYouMayKnow:', error);
        res.status(500).send({ message: 'Error fetching people you may know', error });
    }
};
