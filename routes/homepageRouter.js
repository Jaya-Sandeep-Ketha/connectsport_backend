const express = require("express");
const homepageRouter = express.Router();
const authenticateToken= require('../middleware/auth');
<<<<<<< HEAD
const {home, addNewPost, handleLike, addComment, search, profile}=require('../controllers/homecontroller');
=======
const {home, addNewPost, handleLike, addComment, handleShare}=require('../controllers/homecontroller');
>>>>>>> 43d22f577b8b5b9aaad172ff4ffb4ef5458de354
const expressFormidable =require("express-formidable");

homepageRouter.get('/posts', authenticateToken, home);
homepageRouter.post('/newpost', authenticateToken, expressFormidable({maxFieldsSize:5*1024*1024}), addNewPost);
homepageRouter.put('/:user/posts/:id/like', authenticateToken, handleLike);
homepageRouter.put('/:user/posts/:id/comment', authenticateToken, addComment);
<<<<<<< HEAD
homepageRouter.get('/search', search);
homepageRouter.get('/user/:userId', profile);
=======
homepageRouter.get('/:user/posts/:id/share', handleShare);
// Uncomment and adjust the path as necessary for your model
const users = require('../model/User');
>>>>>>> 43d22f577b8b5b9aaad172ff4ffb4ef5458de354

module.exports = homepageRouter;
