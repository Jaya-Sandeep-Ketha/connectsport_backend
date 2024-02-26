require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const cors = require("cors");
const bodyParser = require("body-parser");
const emailValidator = require("email-validator");
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // You should add this to your .env
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
// console.log(process.env.MONGODB_URI); // Remove after testing
// console.log(process.env.JWT_SECRET); // Remove after testing

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

// Define user schema and model
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  gender: String,
  email: String,
  userId: String,
  password: String,
  favoriteSports: [String],
  termsAgreed: Boolean,
});

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(bodyParser.json());

// Handle registration
app.post("/register", async (req, res) => {
  const userData = req.body;

  // Validate data
  if (
    !userData.firstName ||
    !userData.lastName ||
    !userData.age ||
    !userData.gender ||
    !userData.email ||
    !userData.userId ||
    !userData.password
  ) {
    return res.status(400).send("Missing Details");
  }
  // Validate email format
  if (!emailValidator.validate(userData.email)) {
    return res.status(400).send("Invalid email format");
  }

  // Check if email is already registered
  const emailExists = await User.exists({ email: userData.email });
  if (emailExists) {
    return res.status(400).send("Email already registered");
  }
  // Check if username is already registered
  const usernameExists = await User.exists({ userId: userData.userId });
  if (usernameExists) {
    return res.status(400).send("Username not available");
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  userData.password = hashedPassword;
  console.log("Hashed password:", hashedPassword);
  // Save user to database
  try {
    console.log("Attempting to register user:", userData);
    const user = new User(userData);
    await user.save();
    res.status(200).send("User registered successfully");
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).send("Registration failed");
  }
});


// ... existing code ...

// Google authentication endpoint
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  // Verify Google token
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  try {
    const payload = await verify();

    // Check if the user already exists
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      // Create a new user if not exists
      user = new User({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        // Add other user fields if necessary
      });
      await user.save();
    }

    // Generate JWT token for the user
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Respond with JWT token and user information
    res.json({
      token: jwtToken,
      userId: user._id,
      email: user.email,
      name: user.firstName + ' ' + user.lastName
      // Include other user info if needed
    });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(500).send('Authentication failed');
  }
});


app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  // Validate data
  if (!userId || !password) {
    return res.status(400).send("Missing user ID or password");
  }

  // Check if user exists and password is correct
  try {
    const user = await User.findOne({ userId: userId });
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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => console.log("Server is running on port 3000"));
