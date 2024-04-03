const express = require('express');
const pageRouter = express.Router();
const pageController = require('../controllers/pageController');

// Route to fetch all pages
pageRouter.get('/pages', pageController.getPages);
// Route to fetch a single page by ID
pageRouter.get('/pages/:id', pageController.getPageById);

pageRouter.post('/createpage', pageController.createPage);
pageRouter.post('/pages/:id/toggle-follow', pageController.follow_unfollow);
pageRouter.get('/pages/:id/posts', pageController.getPosts);
// pageRouter.post('/:id/post', pageController.createPost);
// pageRouter.post('/:id/donate', pageController.donate);

module.exports = pageRouter;
