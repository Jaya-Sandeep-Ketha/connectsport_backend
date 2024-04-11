const express = require("express");
const homepageRouter = express.Router();
const authenticateToken= require('../middleware/auth');
const {home, addNewPost, handleLike, addComment, handleShare, search, profile,addNewPoll,handleVote}=require('../controllers/homecontroller');
const expressFormidable =require("express-formidable");

homepageRouter.get('/posts', authenticateToken, home);
homepageRouter.post('/newpost', authenticateToken, expressFormidable({maxFieldsSize:5*1024*1024}), addNewPost);
homepageRouter.put('/:user/posts/:id/like', authenticateToken, handleLike);
homepageRouter.put('/:user/posts/:id/comment', authenticateToken, addComment);
homepageRouter.get('/search', search);
homepageRouter.get('/user/:userId', profile);
homepageRouter.get('/:user/posts/:id/share', authenticateToken,handleShare);
homepageRouter.post('/newpoll',authenticateToken, addNewPoll);
homepageRouter.put('/:user/polls/:id/vote', authenticateToken, handleVote);

module.exports = homepageRouter;
