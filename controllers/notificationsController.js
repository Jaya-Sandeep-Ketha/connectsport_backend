// controllers/notificationsController.js
const Notification = require('../model/Notification');
const User = require('../model/User'); // Import the User model

exports.fetchNotifications = async (req, res) => {
    try {
        console.log(`Fetching notifications for user ID: ${req.params.userId}`); // Log the userID being fetched
        const userId = req.params.userId;
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) {
            console.log(`User not found for ID: ${userId}`); // Log when user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User found: ${user}, Last logout time: ${user.lastLogout}`); // Log user details

        const notifications = await Notification.find({
            userId: userId,
            createdAt: { $gt: user.lastLogout }
        }).sort({ createdAt: -1 });

        console.log(`Found ${notifications.length} notifications for user ID: ${userId}`); // Log the number of notifications found

        res.json(notifications);
    } catch (error) {
        console.log(`Error fetching notifications for user ID: ${req.params.userId}: ${error}`); // Log the error
        res.status(500).json({ message: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { userId, notificationId } = req.body;
        await Notification.updateOne({ _id: notificationId, userId: userId }, { read: true });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { userId, notificationId } = req.body;
        await Notification.deleteOne({ _id: notificationId, userId: userId });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Assuming Notification schema includes 'userId', 'message', and 'type'

exports.createNotification = async (userId, message, type) => {
    try {
        const notification = new Notification({
            userId,
            message,
            type
        });
        await notification.save();
        console.log(`Notification created: ${notification}`);
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error; // Rethrow the error to be caught by the calling function
    }
};
