const express = require("express");
const homepageRouter = express.Router();
const authenticateToken= require('../middleware/auth');
const {home, addNewPost}=require('../controllers/homecontroller');
const expressFormidable =require("express-formidable");

homepageRouter.get('/posts',authenticateToken,home);
homepageRouter.post('/newpost',authenticateToken,expressFormidable({maxFieldsSize:5*1024*1024}),addNewPost);


module.exports = homepageRouter;
