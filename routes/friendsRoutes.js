const express = require('express');
const router = express.Router();
const networkController = require('../controllers/friendscontroller'); // Adjust the path as necessary

// Set up routes
router.get('/friend-requests', networkController.getFriendRequests);
router.get('/people', networkController.getPeopleYouMayKnow);

module.exports = router;
