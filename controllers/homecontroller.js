const User = require('../model/User');
const Posts=require('../model/Posts');
const Network=require('../model/Network');
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
        const userPosts = await Posts.find({ userId: userId }).sort({ createdAt: -1 });
        const userNetwork=await Network.find({userId: userId});
        let FriendPost=[];
        let userFriendsPosts=[]
        if(userNetwork && userNetwork[0].friends.length>0){
          const friends=userNetwork[0].friends;
          for(let i=0;i<friends.length;i++)
          {
            FriendPost=await Posts.find({userId:friends[i]}).sort({createdAt:-1});
            if(FriendPost!=[]){
              userFriendsPosts=userFriendsPosts.concat(FriendPost);
            }
          }
        }
        const allPosts=[...userPosts, ...userFriendsPosts]
        res.json(allPosts);
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
    const result= await cloudinary.uploader.upload(req.files.image.path);
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
  
exports.handleLike = async(req,res) => {
  try{
    const user=req.params.user;
    const postId=req.params.id;
    let updatedPost;
    // Check if user is already in likes array
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likesSet = new Set(post.likes);
    if (likesSet.has(user)) {
      // User is already in likes, so remove the user
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $pull: { likes: user } },
        { new: true }
      );
    } else {
      // User is not in likes, so add the user
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: user } },
        { new: true }
      );
    }

    // Send the updated post back as JSON response
    res.status(201).json(updatedPost);
  }
  catch(error){
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
 


exports.addComment =async(req,res) => {
  try{
    const user=req.params.user;
    const postId=req.params.id;    
    const { content } = req.body;
    const updatedPost= await Posts.findByIdAndUpdate(postId,{
      $push:{comments:{ content, commenter:user }}
    },{
      new:true
    });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Send the updated post back as JSON response
    res.status(201).json(updatedPost);
  }
  catch(error){
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
