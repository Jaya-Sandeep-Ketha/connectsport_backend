const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// Assuming your notifications controller and route setup is correct
router.get('/notifications/:userId', notificationsController.fetchNotifications);
router.post('/mark-as-read', notificationsController.markNotificationAsRead);
router.delete('/delete', notificationsController.deleteNotification);

module.exports = router;
