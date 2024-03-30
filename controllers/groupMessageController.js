const { createNotification } = require("./notificationsController");
const Group = require("../model/group");
const Message = require("../model/Message");
const Network = require("../model/Network");

// Fetch all groups the current user is a part of
exports.getGroups = async (req, res) => {
  const currentUser = req.params.currentUser;
  try {
    const groups = await Group.find({ members: currentUser });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups for current user:", error);
    res.status(500).send("Internal server error");
  }
};

// Create a new group
exports.createGroups = async (req, res) => {
  const { name, members } = req.body;
  try {
    const newGroup = new Group({ name, members });
    await newGroup.save();
    console.log(`Notifying members: `, members); // Log the members to be notified
    // Send a notification to each member
    await Promise.all(
      members.map(async (member) => {
        // Log before creating notification
        console.log(`Creating notification for member ID: ${member}`);
        // Create a notification for each member
        await createNotification(
          member, // Receiver of the notification
          `You are added in a group ${name}.`, // Message of the notification
          "added_to_group" // Type of the notification
        );
      })
    );




    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating new group:", error);
    res.status(500).send("Internal server error");
  }
};

// Fetch members of a group by group name
exports.fetchMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findOne({ name: groupId });
    if (!group) {
      return res.status(404).send("Group not found");
    }
    res.json(group.members);
  } catch (error) {
    console.error("Error fetching group members by name:", error);
    res.status(500).send("Internal server error");
  }
};

// Fetch non-member friends for a specific group (assumes groupName and currentUser are passed correctly)
exports.fetchNonMembers = async (req, res) => {
  const { groupName } = req.params;
  const { currentUser } = req.query; // Assuming currentUser is passed as a query parameter for security reasons

  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).send("Group not found");
    }

    const userNetwork = await Network.findOne({ userId: currentUser });
    if (!userNetwork) {
      return res.status(404).send("User network not found");
    }

    const nonMemberFriends = userNetwork.friends.filter(
      (friendUserId) => !group.members.includes(friendUserId)
    );

    res.json(nonMemberFriends);
  } catch (error) {
    console.error("Error fetching non-member friends:", error);
    res.status(500).send("Internal server error");
  }
};

// Backend route adjusted for adding a member
exports.addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findOne({ name: groupId }); // Corrected line here
    if (!group) {
      return res.status(404).send("Group not found");
    }

    if (group.members.includes(userId)) {
      return res.status(400).send("User already a member of the group");
    }

    group.members.push(userId);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).send("Internal server error");
  }
};

// Adjusted to use POST for removing a user from a group, matching frontend expectations
exports.removeMember = async (req, res) => {
  const { groupName } = req.params;
  const { userId } = req.body;
  try {
    // Note: Assuming 'name' is the correct field for group's name. Replace 'name' with the correct field if different.
    const group = await Group.findOne({ name: groupName }); // Corrected line here
    if (!group) {
      return res.status(404).send("Group not found");
    }

    if (!group.members.includes(userId)) {
      return res.status(400).send("User not a member of the group");
    }

    group.members = group.members.filter((member) => member !== userId);
    await group.save();
    res.json(group);
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).send("Internal server error");
  }
};

// Post a new message to a group
exports.postMessage = async (req, res) => {
  const { senderId, text } = req.body;
  const { groupId } = req.params;

  try {
    const newMessage = new Message({
      senderId,
      text,
      groupId,
    });
    await newMessage.save();

    const group = await Group.findOne({ name: groupId }); // Assuming 'name' is the field in your Group model that stores the group name
    // If the group does not exist
    if (!group) {
      return res.status(404).send("Group not found");
    }
    const members = group.members.filter((member) => member !== senderId); // Use string comparison for IDs
    console.log(`Notifying members: `, members); // Log the members to be notified
    // Send a notification to each member
    await Promise.all(
      members.map(async (member) => {
        // Skip the sender
        if (member === senderId) return;
        // Log before creating notification
        console.log(`Creating notification for member ID: ${member}`);
        // Create a notification for each member
        await createNotification(
          member, // Receiver of the notification
          `You have received new messages in group ${groupId}.`, // Message of the notification
          "new_messages" // Type of the notification
        );
      })
    );
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error posting message to group:", error);
    res.status(500).send("Internal server error");
  }
};

// Fetch messages from a group
exports.getMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.find({ groupId }).sort("timestamp");
    res.json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).send("Internal server error");
  }
};
