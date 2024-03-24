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
router.get('/search', friendsController.searchUsers);
router.post('/block', friendsController.blockUser);
// Route for unblocking a user
router.post('/unblock', friendsController.unblockUser);
// Route to fetch blocked users
router.get('/blocked-users', friendsController.getBlockedUsers);
router.get('/sports-options', friendsController.getSportsOptions);
router.get('/friends-options', friendsController.getFriendsOptions);


module.exports = router;

