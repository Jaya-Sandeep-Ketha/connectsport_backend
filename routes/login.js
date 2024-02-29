const express = require("express");
const loginRouter = express.Router(); 
//const {userVerification} = require('../middleware/auth')
const { login, register,googleAuth } = require("../controllers/authcontroller"); // Adjust the path as necessary
loginRouter.post("/register", register);
loginRouter.post("/login", login);

loginRouter.post("/auth/google", googleAuth);

//loginRouter.post('/',userVerification)
module.exports = loginRouter;