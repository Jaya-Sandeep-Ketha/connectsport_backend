const userModel = require('../model/User');
const jwt = require('jsonwebtoken');
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require("express");
const loginRouter = express.Router(); 

loginRouter.post("/register", async (req, res) => {
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
      !userData.securityAnswer1 ||
      !userData.securityQuestion2 ||
      !userData.securityAnswer2
    ){
      return res.status(400).send("Missing Details");
    }
    // Restructure security questions
  userData.securityQuestions = [
    { question: userData.securityQuestion1, answer: userData.securityAnswer1 },
    { question: userData.securityQuestion2, answer: userData.securityAnswer2 }
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
    const emailExists = await userModel.exists({ email: userData.email });
    if (emailExists) {
      return res.status(400).send("Email already registered");
    }
    // Check if username is already registered
    const usernameExists = await userModel.exists({ userId: userData.userId });
    if (usernameExists) {
      return res.status(400).send("Username not available");
    }
  
    // Save user to database
    try {
      console.log("Attempting to register user:", userData);
      const user = new userModel(userData);
      await user.save();
      res.status(200).send("User registered successfully");
    } catch (error) {
      console.error("Registration failed:", error);
      res.status(500).send("Registration failed");
    }
  });


  loginRouter.post("/login", async (req, res) => {
    const { userId, password }= req.body;
    // Validate data
    if (!userId || !password) {
      return res.status(400).send("Missing user ID or password");
    }
  
    // Check if user exists and password is correct
    try {
      const user = await userModel.findOne({ userId: userId });
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
  });

  module.exports = loginRouter;