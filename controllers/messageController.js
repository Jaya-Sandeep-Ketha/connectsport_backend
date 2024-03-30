const Message = require('../model/Message'); // Path to your Message model
const { createNotification } = require('./notificationsController');

// Post a new message
exports.postMessage = async (req, res) => {
    const { senderId, receiverId, text } = req.body;
   
    try {
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();

        await createNotification(
            receiverId, // Receiver of the notification
            `${senderId} sent you a message.`, // Message of the notification
            "message_received" // Type of the notification
        );
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error); // Log any errors
        res.status(500).send('Internal server error');
    }
};

exports.getMessage = async (req, res) => {
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
};

