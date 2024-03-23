const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendscontroller'); // Adjust the path as necessary

// Set up routes
router.get('/friend-requests', friendsController.getFriendRequests);
router.get('/people', friendsController.getPeopleYouMayKnow);
router.post('/send-request', friendsController.sendFriendRequest);
router.post('/cancel-request', friendsController.cancelFriendRequest);
router.post('/accept-request', friendsController.acceptFriendRequest);
router.post('/reject-request', friendsController.rejectFriendRequest);



module.exports = router;

