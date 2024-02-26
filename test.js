const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userModel = require("./model/User"); 
const session = require("express-session");


const app = express();

app.options('*', cors());

// Use the express-session middleware
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/verify-user", async (req, res) => {
  const { email } = req.body;
  console.log("Email received:", email);
  console.log("Prev Set Email:", req.session.email);
  // Find the user with the provided email
  const user = await userModel.findOne({email:email});

  if (!user) {
    return res.status(400).json({ message: "No user found with this email." });
  }
  // Store the email in the session
  req.session.email = email;
  console.log("Email stored in session:", req.session.email);
  res.json({ message: "User found" });
});


app.get("/api/security-questions/" , async (req, res) => {
  console.log("===== Session email:", req.session.email);
  const email = req.session.email;
  console.log("===== Query email:", email);
  const user = await userModel.findOne({email:email});
  console.log("===== User found:", user);
  res.json({ securityQuestion1: user.securityQuestion1, securityQuestion2: user.securityQuestion2 });
});


app.listen(3000, () => console.log("Server is running on port 3000"));