const express = require("express");
const homepageRouter = express.Router();
const authenticateToken= require('../middleware/auth');
const {home, addNewPost, handleLike, addComment, handleShare}=require('../controllers/homecontroller');
const expressFormidable =require("express-formidable");

homepageRouter.get('/posts', authenticateToken, home);
homepageRouter.post('/newpost', authenticateToken, expressFormidable({maxFieldsSize:5*1024*1024}), addNewPost);
homepageRouter.put('/:user/posts/:id/like', authenticateToken, handleLike);
homepageRouter.put('/:user/posts/:id/comment', authenticateToken, addComment);
homepageRouter.get('/:user/posts/:id/share', handleShare);
// Uncomment and adjust the path as necessary for your model
const users = require('../model/User');

homepageRouter.get('/search/users', async (req, res) => {
    const searchQuery = req.query;
    // console.log(searchQuery)
    try {
      const user = await users.find({
        $or: [
            { userId: new RegExp(searchQuery.query, 'i') }, 
            { name: new RegExp(searchQuery, 'i') }
        ]
      }).limit(5);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error searching for users');
    }
});

// Remove the incorrect export statement
// module.exports = router;

// Correctly export homepageRouter
module.exports = homepageRouter;
