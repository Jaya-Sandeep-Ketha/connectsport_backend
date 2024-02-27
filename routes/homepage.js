// const express = require("express");
// const homepageRouter = express.Router();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

// // Sample data for posts
// let posts = [
//     { id: 1, author: 'John Doe', content: 'This is a sample post', imageUrl: 'https://as2.ftcdn.net/v2/jpg/05/60/89/51/1000_F_560895109_gDZfUM1GDqw8CYdJIg4YF9xl4ByCFSat.jpg' },
//     { id: 2, author: 'Jane Doe', content: 'This is another sample post', imageUrl: 'https://www.thenews.com.pk/assets/uploads/updates/2024-02-23/1160706_3734284_virat-kohli-anushka-sharma_updates.jpg' }
// ];

// // Routes for handling posts
// homepageRouter.get('/posts', (req, res) => {
//     res.json(posts);
// });

// homepageRouter.post('/posts', upload.single('image'), (req, res) => {
//     const { author, content } = req.body;
//     const imageUrl = req.file ? req.file.path : ''; // Get the path of the uploaded file
//     const newPost = { id: posts.length + 1, author, content, imageUrl };
//     posts.push(newPost);
//     res.status(201).json(newPost);
//   });

// module.exports = homepageRouter;
