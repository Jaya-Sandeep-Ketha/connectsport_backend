const User = require('../model/User');
const Posts=require('../model/Posts');
const fs = require('fs');
const cloudinary =require("cloudinary");
          
cloudinary.config({ 
  cloud_name: 'dahn4amxv', 
  api_key: '243612482398736', 
  api_secret: '7hiZZCtCB7HssWsKlP1YlseI3CI' 
});


exports.home = async(req,res)=>{
    try {
        const userId = req.userId; // Extracted from JWT token
        console.log(userId);
        const userPosts = await Posts.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(userPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Handle new post creation
exports.addNewPost = async (req, res) => {
  try {
    const { content, tag, author } = req.fields;
    const imageFile = req.files;
    if (!content || !tag || !author || !imageFile) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    console.log(typeof(content));
    const result= await cloudinary.uploader.upload(req.files.image.path);
    console.log(result);
      // Example: Create a new post document with image data
    const newPost = new Posts({
      postTitle: tag, // Convert to string if necessary
      postDescription: content,
      userId:author,
      image: {
        public_id: result.public_id, 
        url: result.url 
      },
    });
      // Save the new post
      await newPost.save();
  
  
      res.status(201).json(newPost); // Send the created post data in the response
    } catch (error) {
      console.error('Error creating new post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
