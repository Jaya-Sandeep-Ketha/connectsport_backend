const groupMessageController = require('../controllers/groupMessageController'); // Adjust the path as necessary
const express = require("express");
const router = express.Router();

router.get("/groups/:currentUser", groupMessageController.getGroups);
router.post("/groups", groupMessageController.createGroups);
router.get("/groups/:groupId/members", groupMessageController.fetchMembers);
router.get("/groups/:groupName/nonMemberFriends", groupMessageController.fetchNonMembers);
router.post("/groups/:groupId/addMember", groupMessageController.addMember);
router.post("/groups/:groupName/removeMember", groupMessageController.removeMember);
router.post("/groups/:groupId/messages", groupMessageController.postMessage);
router.get("/groups/:groupId/messages", groupMessageController.getMessages);

module.exports = router;
