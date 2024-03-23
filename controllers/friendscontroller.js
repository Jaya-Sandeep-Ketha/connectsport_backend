const Network = require('../model/Network');
const User = require('../model/User');

// // Define controller methods
// exports.getFriendRequests = async (req, res) => {
//     try {
//         const userId = req.query.userId; // As we're getting userId from query parameters
//         const network = await Network.findOne({ userId }).populate('reqReceived');
//         res.json(network ? network.reqReceived : []);
//     } catch (error) {
//         res.status(500).send({ message: 'Error fetching friend requests', error });
//     }
// };

exports.getFriendRequests = async (req, res) => {
    try {
        const userId = req.query.userId; // As we're getting userId from query parameters
        let network = await Network.findOne({ userId }).populate('reqReceived');

        if (!network) {
            console.log('Network not found for:', userId);
            network = new Network({
                userId,
                friends: [],
                blocked: [],
                reqSent: [],
                reqReceived: []
            });
            await network.save(); // Initially, there will be no friend requests to populate
            res.json([]); // Return an empty array as there are no friend requests yet
            return;
        }

        const requestsWithDetails = await Promise.all(network.reqReceived.map(async (reqUserId) => {
            const user = await User.findOne({ userId: reqUserId }, 'userId firstName lastName');
            return {
                userId: user.userId,
                name: `${user.firstName} ${user.lastName}`,
                // Add any additional fields you need
            };
        }));

        res.json(requestsWithDetails);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
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


// // Method to send a friend request
// exports.sendFriendRequest = async (req, res) => {
//     const { userId, targetUserId } = req.body; // Assume body contains your userId and the target's userId

//     try {
//         // Update the requester's Network to include targetUserId in reqSent
//         await Network.updateOne(
//             { userId: userId },
//             { $addToSet: { reqSent: targetUserId } } // $addToSet avoids duplicates
//         );

//         // Update the target's Network to include your userId in reqReceived
//         await Network.updateOne(
//             { userId: targetUserId },
//             { $addToSet: { reqReceived: userId } }
//         );

//         res.status(200).json({ message: "Friend request sent successfully." });
//     } catch (error) {
//         console.error('Error sending friend request:', error);
//         res.status(500).send({ message: 'Error sending friend request', error });
//     }
// };

exports.sendFriendRequest = async (req, res) => {
    const { userId, targetUserId } = req.body;

    try {
        // Ensure both the requester and the target user exist in the Network collection
        const [requesterNetwork, targetUserNetwork] = await Promise.all([
            Network.findOneAndUpdate({ userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }),
            Network.findOneAndUpdate({ userId: targetUserId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })
        ]);

        // Update the requester's Network to include targetUserId in reqSent
        await Network.updateOne({ userId }, { $addToSet: { reqSent: targetUserId } });

        // Update the target's Network to include userId in reqReceived
        await Network.updateOne({ userId: targetUserId }, { $addToSet: { reqReceived: userId } });

        res.status(200).json({ message: "Friend request sent successfully." });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).send({ message: 'Error sending friend request', error });
    }
};

// Method to cancel a friend request
exports.cancelFriendRequest = async (req, res) => {
    const { userId, targetUserId } = req.body; // Assume body contains your userId and the target's userId

    try {
        // Update the requester's Network to remove targetUserId from reqSent
        await Network.updateOne(
            { userId: userId },
            { $pull: { reqSent: targetUserId } }
        );

        // Update the target's Network to remove your userId from reqReceived
        await Network.updateOne(
            { userId: targetUserId },
            { $pull: { reqReceived: userId } }
        );

        res.status(200).json({ message: "Friend request canceled successfully." });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        res.status(500).send({ message: 'Error canceling friend request', error });
    }
};


exports.acceptFriendRequest = async (req, res) => {
    const { userId, friendId } = req.body; // Assuming you send your ID and the ID of the person whose request you're accepting

    try {
        // Update both users' Networks
        await Network.findOneAndUpdate(
            { userId: userId },
            {
                $pull: { reqReceived: friendId },
                $addToSet: { friends: friendId }
            }
        );

        await Network.findOneAndUpdate(
            { userId: friendId },
            { $pull: { reqSent: userId }, $addToSet: { friends: userId } }
        );

        res.status(200).json({ message: "Friend request accepted." });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).send({ message: 'Error accepting friend request', error });
    }
};

exports.rejectFriendRequest = async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        // Remove the friend request from both users' Networks
        await Network.findOneAndUpdate(
            { userId: userId },
            { $pull: { reqReceived: friendId } }
        );

        await Network.findOneAndUpdate(
            { userId: friendId },
            { $pull: { reqSent: userId } }
        );

        res.status(200).json({ message: "Friend request rejected." });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).send({ message: 'Error rejecting friend request', error });
    }
};