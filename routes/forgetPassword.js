const express = require("express");
const forgetPasswordRouter = express.Router();
const forgetPassController = require('../controllers/forgetpasscontroller');

forgetPasswordRouter.post("/verify-user", forgetPassController.verifyuser);
forgetPasswordRouter.get("/api/security-questions/", forgetPassController.securityquestions);
forgetPasswordRouter.post("/verify-answers", forgetPassController.verifyanswers);
forgetPasswordRouter.post("/api/verify-otp", forgetPassController.verifyotp);
forgetPasswordRouter.post("/api/change-password", forgetPassController.changepassword);

module.exports = forgetPasswordRouter;