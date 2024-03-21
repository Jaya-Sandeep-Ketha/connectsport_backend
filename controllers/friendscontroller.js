const User = require('../model/User');

exports.getFriends = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Populate the friends list
        await user.populate('friends', 'firstName lastName -_id').execPopulate();

        // If the user has no friends, you might want to handle this case differently
        if (user.friends.length === 0) {
            return res.status(200).json({ message: 'No friends to show.' });
        }

        res.json(user.friends);
    } catch (err) {
        console.error(err.message);

        // You could differentiate between different kinds of errors if needed
        if (err.kind === 'ObjectId') {
            return res.status(404).send('User not found');
        }

        res.status(500).send('Server Error');
    }
};


exports.sendFriendRequest = async (req, res) => {
    const { recipientId } = req.body; // ID of the user who is receiving the friend request
    try {
        const recipient = await User.findById(recipientId);
        const sender = await User.findById(req.user.id);
        
        // Check if recipient already received a request from this sender
        if(recipient.friendRequests.includes(sender._id)) {
            return res.status(400).send('Friend request already sent.');
        }
        
        // Add sender's ID to recipient's friendRequests
        recipient.friendRequests.push(sender._id);
        await recipient.save();
        
        res.status(200).send('Friend request sent.');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.acceptFriendRequest = async (req, res) => {
    const { senderId } = req.body; // ID of the user whose friend request is being accepted
    try {
        const sender = await User.findById(senderId);
        const recipient = await User.findById(req.user.id);
        
        // Remove sender's ID from recipient's friendRequests
        recipient.friendRequests = recipient.friendRequests.filter(request => request.toString() !== senderId);
        
        // Add each other to friends array
        recipient.friends.push(sender._id);
        sender.friends.push(recipient._id);

        await recipient.save();
        await sender.save();

        res.status(200).send('Friend request accepted.');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.removeFriend = async (req, res) => {
    const { friendId } = req.params; // ID of the friend to remove
    try {
        const user = await User.findById(req.user.id);
        const friend = await User.findById(friendId);
        
        // Remove each other from friends array
        user.friends = user.friends.filter(friend => friend.toString() !== friendId);
        friend.friends = friend.friends.filter(userFriend => userFriend.toString() !== user._id);

        await user.save();
        await friend.save();

        res.status(200).send('Friend removed.');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};