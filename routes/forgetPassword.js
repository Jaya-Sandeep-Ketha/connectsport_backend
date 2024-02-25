
const express = require("express");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const userModel = require("../model/User"); 
// const session = require("express-session");

const forgetPasswordRouter = express.Router(); 


// Use the express-session middleware
// forgetPasswordRouter.use(session({
//     secret: 'secret-key',
//     resave: false,
//     saveUninitialized: true
//   }));

forgetPasswordRouter.post("/verify-user", async (req, res) => {
    const { email } = req.body;
    console.log("Email received:", email);
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


forgetPasswordRouter.get("/api/security-questions/" , async (req, res) => {

    console.log("===== Session email:", req.session.email);
    const email = req.session.email;
    console.log("===== Query email:", email);
    const user = await userModel.findOne({email:email});
    console.log("===== User found:", user);
    res.json({ securityQuestion1: user.securityQuestion1, securityQuestion2: user.securityQuestion2 });
});

forgetPasswordRouter.post("/api/verify-answers", async (req, res) => {
    const security = req.body;
    const email = req.session.email;
    const user = await userModel.findOne({email:email});

    if(security.securityAnswer1 === user.securityAnswer1 && security.securityAnswer2 === user.securityAnswer2){ 
        res.json({ message: "Security questions verified" });
    } else {
        res.status(400).json({ message: "Security questions not verified" });
    }

    // Generate a one-time password (OTP)
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({ secret: secret.base32, encoding: "base32" });

  // Store the OTP in the user's document for later verification
  user.otp = otp;
  await user.save();

  // Send the OTP to the user's email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nehareddyvantari8@gmail.com",
      pass: "nehareddy81120",
    },
  });

  const mailOptions = {
    from: "nehareddyvantari8@gmail.com",
    to: user.email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  res.json({ message: "OTP sent to your email." });
});

forgetPasswordRouter.post("/api/verify-otp", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  // Find the user with the provided email
  const user = await userModel.findOne({email:email});

  if (!user) {
    return res.status(400).json({ message: "No user found with this email." });
  }

  // Verify the provided OTP
  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }


  res.json({ message: "OTP verified" });
});
forgetPasswordRouter.post("/api/change-password", async (req, res) => {
    const { newPassword } = req.body;
    const email = req.session.email;
    
    // Find the user with the provided email
    const user = await userModel.findOne({email:email});
    // Set the new password
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
});


module.exports = forgetPasswordRouter;