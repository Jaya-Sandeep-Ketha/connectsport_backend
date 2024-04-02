const express = require('express');
const pageRouter = express.Router();
const pageController = require('../controllers/pageController');

pageRouter.post('/createpage', pageController.createPage);
pageRouter.post('/:id/follow', pageController.followPage);
pageRouter.post('/:id/post', pageController.createPost);
pageRouter.post('/:id/donate', pageController.donate);

module.exports = pageRouter;
