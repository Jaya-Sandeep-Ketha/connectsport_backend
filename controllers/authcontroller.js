const UserModel = require("../model/User");
const NetworkModel = require("../model/Network");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const axios = require('axios');

const register = async (req, res) => {
  const userData = req.body;

  // Validate data
  if (
    !userData.firstName ||
    !userData.lastName ||
    !userData.age ||
    !userData.gender ||
    !userData.email ||
    !userData.userId ||
    !userData.password ||
    !userData.securityQuestion1 ||
    !userData.securityQuestion2 ||
    !userData.securityAnswer1 ||
    !userData.securityAnswer2
  ) {
    return res.status(400).send("Missing Details");
  }
  // Restructure security questions
  userData.securityQuestions = [
    { question: userData.securityQuestion1, answer: userData.securityAnswer1 },
    { question: userData.securityQuestion2, answer: userData.securityAnswer2 },
  ];
  delete userData.securityQuestion1;
  delete userData.securityAnswer1;
  delete userData.securityQuestion2;
  delete userData.securityAnswer2;

  // Validate email format
  if (!emailValidator.validate(userData.email)) {
    return res.status(400).send("Invalid email format");
  }

  // Check if email is already registered
  const emailExists = await UserModel.exists({ email: userData.email });
  if (emailExists) {
    return res.status(400).send("Email already registered");
  }
  // Check if username is already registered
  const usernameExists = await UserModel.exists({ userId: userData.userId });
  if (usernameExists) {
    return res.status(400).send("Username not available");
  }
  // Save user to database
  try {
    const user = new UserModel(userData);
    await user.save();

    // Also add the user to the Networks model with all fields initialized as empty
    const userNetwork = new NetworkModel({
      userId: userData.userId, // Assuming Networks model references UserModel via userId
      friends: [], // Initialize friends as an empty array
      blocked: [],
      reqReceived: [],
      reqSent: [],
      pages_following: [], // Initialize pages_following as an empty array
    });
    await userNetwork.save();

    res.status(200).send("User registered successfully");
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).send("Registration failed");
  }
};

const userLoggedOut = async (userId) => {
  console.log(`Attempting to log out user with ID: ${userId}`);
  await UserModel.findOneAndUpdate(
    { userId: userId },
    { $set: { lastLogout: new Date() } }
  );
  console.log(`Successfully updated logout time for user with ID: ${userId}`);
};

const login = async (req, res) => {
  const { userId, password, recaptchaToken } = req.body;

  if (!userId || !password) {
    return res.status(400).send("Missing user ID or password");
  }

  try {
    const user = await UserModel.findOne({ userId: userId });
    if (!user) {
      return res.status(400).send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send("Incorrect password");
    }

    // Check if CAPTCHA is required (i.e., the user is logging in for the first time after password reset)
    if (user.passwordResetExpires && new Date() < new Date(user.passwordResetExpires)) {
      if (!recaptchaToken) {
        return res.status(400).send("CAPTCHA required");
      }
      
      // Perform CAPTCHA verification
      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
          },
        }
      );

      if (!recaptchaResponse.data.success) {
        console.log('CAPTCHA failed:', recaptchaResponse.data);
        return res.status(400).send("CAPTCHA verification failed");
      }

      // Update the user document to clear the passwordResetExpires as CAPTCHA is verified
      await UserModel.findOneAndUpdate({ userId: userId }, { $unset: { passwordResetExpires: "" } });
    }

    // JWT token creation
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.json({ message: "Login successful", token, userId: user.userId });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error during login");
  }
};


const logout = async (req, res) => {
  try {
    const userId = req.body.userId; // Get userId from request body
    console.log("Received request body:", req.body);
    console.log(`Logout request received for user ID: ${userId}`);

    // Validate userId presence
    if (!userId) {
      console.log("Logout attempt without a user ID");
      return res.status(400).send("User ID is missing");
    }

    // Update user's last logout time
    await userLoggedOut(userId);
    console.log(`Logout successful for user ID: ${userId}`);
    res.send("Logout successful");
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Error during logout");
  }
};

// Add the googleAuth function
const googleAuth = async (req, res) => {
  console.log("Google auth endpoint hit", req.body);
  const { email, name, providerId } = req.body;

  // Check if user exists
  let user = await UserModel.findOne({ email: email });

  if (!user) {
    // If user does not exist, create a new user
    user = new UserModel({
      email: email,
      userId: name, // You might want to generate a unique userId here
      providerId: providerId,
      // Add other necessary fields
    });
    await user.save();
  }

  // JWT token creation
  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.json({ message: "Login successful", token, userId: user.userId });
};

const facebookAuth = async (req, res) => {
  console.log("Facebook auth endpoint hit", req.body);
  try {
    const { email, name, providerId } = req.body;

    // Check if user exists
    let user = await UserModel.findOne({ email: email });

    if (!user) {
      user = new UserModel({
        email: email,
        userId: name, // Consider ensuring userId uniqueness or using email
        providerId: providerId,
        // Add other necessary fields
      });
      await user.save();
    }

    // JWT token creation
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ message: "Login successful", token, userId: user.userId });
  } catch (error) {
    console.error("Error during Facebook authentication:", error);
    res.status(500).send("Authentication failed due to server error");
  }
};

module.exports = {
  login,
  logout,
  register,
  googleAuth,
  facebookAuth,
};