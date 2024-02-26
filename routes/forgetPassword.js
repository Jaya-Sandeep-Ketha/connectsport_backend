
const express = require("express");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const userModel = require("../model/User"); 
const crypto = require("crypto");

const forgetPasswordRouter = express.Router(); 



forgetPasswordRouter.post("/verify-user", async (req, res) => {
    const { email } = req.body;
    console.log("Email received:", email);
    // Find the user with the provided email
    const user = await userModel.findOne({email:email});
  
    if (!user) {
      return res.status(400).json({ message: "No user found with this email." });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    res.json({ message: "User found" ,token: token});
});





forgetPasswordRouter.get("/api/security-questions/" , async (req, res) => {
    const { token } = req.query;
    console.log("Token received:", token);
    const user = await userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const response = { 
      message: "Token verified.",
      questions: {
        question1: user.securityQuestions[0].question, 
        question2: user.securityQuestions[1].question
      } 
    };

    console.log("Response:", response);

    res.json(response);
});





forgetPasswordRouter.post("/api/verify-answers", async (req, res) => {
    const { token, answers } = req.body;
    console.log("==========Answers received:", answers);
    console.log("Token received:", token);
    const user = await userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
  });
  console.log("User found:", user);

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token." });
}

const verifyAnswers = user.securityQuestions.every((q, index) => {
  return q.answer === answers[index];
});

if (!verifyAnswers) {
    return res.status(400).json({ message: "Incorrect answers." });
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
  const { token, otp } = req.body;
  

  // Find the user with the provided token
  const user = await userModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
});

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
    const { token, newPassword } = req.body;
    const user = await userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
  });
    // Set the new password
    user.password = newPassword;
    await user.save();
    // Clear the token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    res.json({ message: "Password changed successfully" });
});


module.exports = forgetPasswordRouter;