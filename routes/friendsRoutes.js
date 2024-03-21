const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const friendsController = require('../controllers/friendscontroller');

// Get friends list
router.get('/', auth, friendsController.getFriends);

// Send a friend request
router.post('/', auth, friendsController.sendFriendRequest);

// Accept a friend request
router.post('/accept', auth, friendsController.acceptFriendRequest);

// Remove a friend
router.delete('/:friendId', auth, friendsController.removeFriend);

module.exports = router;
