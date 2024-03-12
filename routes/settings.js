const express = require("express");
// const User = require("../model/settings_update"); // Make sure this path matches your project structure
const User = require("../model/User"); // Adjust the path as necessary

const settings = express.Router();

// Fetch user details
settings.get("/:userId/settings", async (req, res) => {
  try {
    console.log("Fetching settings for userID:", req.params.userId); // Correctly logging the userID from request parameters
    // Using 'userID' as the field name according to your database schema
    const user = await User.findOne({ userId: req.params.userId });
    console.log("User found:", user); // Logging the found user object (might want to remove sensitive fields in production)

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user); // Send the found user data back to the client
  } catch (error) {
    console.error("Error fetching user settings:", error); // Using console.error for errors
    res.status(500).send("Something went wrong: " + error.message);
  }
});

// Update user details
settings.put("/:userId/settings", async (req, res) => {
  try {
    console.log("Updating settings for userID:", req.params.userId); // Correctly logging the userID from request parameters
    // Ensure proper validation and sanitation of req.body before updating
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { new: true }
    );
    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);

    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log("Updated user settings:", user); // Logging the updated user object
    res.send(user); // Send the updated user data back to the client
  } catch (error) {
    console.error("Error updating user settings:", error); // Using console.error for errors
    res.status(500).send("Something went wrong: " + error.message);
  }
});

module.exports = settings;
