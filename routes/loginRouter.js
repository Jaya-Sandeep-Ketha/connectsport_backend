const express = require("express");
const loginRouter = express.Router(); 
//const {userVerification} = require('../middleware/auth')
const { login, logout, register, googleAuth, facebookAuth, captcha} = require("../controllers/authcontroller"); // Adjust the path as necessary
loginRouter.post("/register", register);
loginRouter.post("/login", login);
loginRouter.post("/logout", logout);
loginRouter.post("/auth/google", googleAuth);
loginRouter.post("/auth/facebook", facebookAuth);

//loginRouter.post('/',userVerification)
module.exports = loginRouter;