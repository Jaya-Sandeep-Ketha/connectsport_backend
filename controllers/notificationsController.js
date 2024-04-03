// controllers/notificationsController.js
const Notification = require('../model/Notification');
const User = require('../model/User'); // Import the User model

exports.fetchNotifications = async (req, res) => {
    try {
        console.log(`Fetching notifications for user ID: ${req.params.userId}`); // Log the userID being fetched
        const userId = req.params.userId;
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const notifications = await Notification.find({
            userId: userId,
            createdAt: { $gt: user.lastLogout }
        }).sort({ createdAt: -1 });
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

exports.createNotification = async (userId, message, type, link = '') => {
    try {
        const notification = new Notification({
            userId,
            message,
            type,
            link
        });
        await notification.save();
        console.log(`Notification created: ${notification}`);
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error; // Rethrow the error to be caught by the calling function
    }
};
