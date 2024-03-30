const express = require("express");
const homepageRouter = express.Router();
const authenticateToken= require('../middleware/auth');
const {home, addNewPost,handleLike,addComment}=require('../controllers/homecontroller');
const expressFormidable =require("express-formidable");

homepageRouter.get('/posts',authenticateToken,home);
homepageRouter.post('/newpost',authenticateToken,expressFormidable({maxFieldsSize:5*1024*1024}),addNewPost);
homepageRouter.put('/:user/posts/:id/like',handleLike);
homepageRouter.put('/:user/posts/:id/comment',addComment);
//homepageRouter.delete('/posts/:id',deletepost);
// Sample data for posts
// let posts = [
//     { id: 1, author: 'John Doe', content: 'This is a sample post', imageUrl: 'https://as2.ftcdn.net/v2/jpg/05/60/89/51/1000_F_560895109_gDZfUM1GDqw8CYdJIg4YF9xl4ByCFSat.jpg' },
//     { id: 2, author: 'Jane Doe', content: 'This is another sample post', imageUrl: 'https://www.thenews.com.pk/assets/uploads/updates/2024-02-23/1160706_3734284_virat-kohli-anushka-sharma_updates.jpg' }
// ];

// // Routes for handling posts
// homepageRouter.get('/posts', (req, res) => {
//     res.json(posts);
// });

module.exports = homepageRouter;
