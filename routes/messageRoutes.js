const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController'); // Adjust the path as necessary

router.post('/:userID/messages', messageController.postMessage);
router.get('/messages', messageController.getMessage);

module.exports = router;
