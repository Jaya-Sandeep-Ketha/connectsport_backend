const express = require('express');
const Network = require('../model/Network'); // Path to your Network model
const router = express.Router();

router.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;

    // Log the userId received in the request
    console.log(`Fetching friends for userId: ${userId}`);

    try {
        // Use the userId to find the network information directly
        console.log(`Fetching network information for user ID: ${userId}`);
        const network = await Network.findOne({ userId: userId }).populate('friends');
        if (!network) {
            console.log('Network information not found for userId:', userId);
            return res.status(404).send('Network information not found');
        }

        // Log the number of friends found (assuming network.friends is an array)
        console.log(`Found ${network.friends.length} friends for userId: ${userId}`);

        res.json(network.friends);
    } catch (error) {
        console.error('Error fetching friends for userId:', userId, error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
