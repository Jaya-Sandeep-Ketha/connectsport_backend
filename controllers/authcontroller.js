const loginModel = require('../model/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const emailValidator = require("email-validator");

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
    ){
      return res.status(400).send("Missing Details");
    }
    // Validate email format
    if (!emailValidator.validate(userData.email)) {
      return res.status(400).send("Invalid email format");
    }
  
    // Check if email is already registered
    const emailExists = await loginModel.exists({ email: userData.email });
    if (emailExists) {
      return res.status(400).send("Email already registered");
    }
    // Check if username is already registered
    const usernameExists = await loginModel.exists({ userId: userData.userId });
    if (usernameExists) {
      return res.status(400).send("Username not available");
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;
    // Save user to database
    try {
      const user = new loginModel(userData);
      await user.save();
      res.status(200).send("User registered successfully");
    } catch (error) {
      console.error("Registration failed:", error);
      res.status(500).send("Registration failed");
    }
};

const login = async (req, res) => {
    const { userId, password }= req.body;
    // Validate data
    if (!userId || !password) {
      return res.status(400).send("Missing user ID or password");
    }
  
    // Check if user exists and password is correct
    try {
      const user = await loginModel.findOne({ userId: userId });
      if (!user) {
        return res.status(400).send("User not found");
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).send("Incorrect password");
      }
  
      // JWT token creation
      const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.json({ message: "Login successful", token, userId: user.userId });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Error during login");
    }
};

module.exports = {
    login,
    register,
};