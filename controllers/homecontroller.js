const jwt = require('jsonwebtoken');
const User = require("../model/User");
const Page = require("../model/page");
const Posts = require("../model/Posts");
const Network = require("../model/Network");
const Polls = require("../model/Polls");
const Notification = require("../model/Notification"); // Assuming this exists
const fs = require("fs");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dahn4amxv",
  api_key: "243612482398736",
  api_secret: "7hiZZCtCB7HssWsKlP1YlseI3CI",
});

// exports.home = async(req,res)=>{
//     try {
//         const userId = req.userId; // Extracted from JWT token
//         const userPosts = await Posts.find({ userId: userId }).sort({ createdAt: -1 });
//         const userNetwork=await Network.find({userId: userId});
//         let FriendPost=[];
//         let userFriendsPosts=[]
//         let userFollowedPagesPosts = [];

//         if(userNetwork && userNetwork[0].friends.length>0){
//           const friends=userNetwork[0].friends;
//           for(let i=0;i<friends.length;i++)
//           {
//             FriendPost=await Posts.find({userId:friends[i]}).sort({createdAt:-1});
//             if(FriendPost!=[]){
//               userFriendsPosts=userFriendsPosts.concat(FriendPost);
//             }
//           }
//         }

//         // Fetching posts from followed pages
//         if (userNetwork && userNetwork.pages_following.length > 0) {
//           const followedPages = userNetwork.pages_following;
//           // Similarly using Promise.all for efficiency
//           const pagesPostsPromises = followedPages.map(pageId =>
//               Posts.find({ pageId: pageId }).sort({ createdAt: -1 })
//           );
//           const pagesPostsResults = await Promise.all(pagesPostsPromises);
//           userFollowedPagesPosts = pagesPostsResults.flat(); // Flatten the array of posts arrays
//       }

//         const allPosts=[...userPosts, ...userFriendsPosts,  ...userFollowedPagesPosts];
//         allPosts.sort((a, b) => b.createdAt - a.createdAt);
//         res.json(allPosts);
//     } catch (error) {
//         console.error('Error fetching user posts:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

// exports.home = async (req, res) => {
//   try {
//       const userId = req.userId; // Extracted from JWT token
//       // Fetching user's own posts
//       const userPosts = await Posts.find({ userId: userId }).sort({ createdAt: -1 });

//       // Initializing array to gather posts from friends and followed pages
//       let userFriendsPosts = [];
//       let userFollowedPagesPosts = [];

//       // Fetching user's network information (friends and followed pages)
//       const userNetwork = await Network.findOne({ userId: userId });

//       // Fetching friends' posts
//       if (userNetwork && userNetwork.friends.length > 0) {
//           const friends = userNetwork.friends;
//           console.log(friends);
//           // Using Promise.all to fetch all friends' posts concurrently for efficiency
//           const friendsPostsPromises = friends.map(async friendId =>{
//             const originalPosts = await Posts.find({ userId: friendId }).sort({ createdAt: -1 });
//             console.log(friendId);
//               const resharedPosts = await Posts.find({ 'shared.userId': friendId }).sort({ createdAt: -1 });
//               console.log(resharedPosts);
//               return [...originalPosts, ...resharedPosts];
//       });
//           const friendsPostsResults = await Promise.all(friendsPostsPromises);
//           userFriendsPosts = friendsPostsResults.flat(); // Flatten the array of posts arrays
//       }

//       // Fetching posts from followed pages
//       if (userNetwork && userNetwork.pages_following.length > 0) {
//           const followedPages = userNetwork.pages_following;
//           // Similarly using Promise.all for efficiency
//           const pagesPostsPromises = followedPages.map(pageId =>
//               Posts.find({ userId: pageId }).sort({ createdAt: -1 })
//           );
//           const pagesPostsResults = await Promise.all(pagesPostsPromises);
//           userFollowedPagesPosts = pagesPostsResults.flat(); // Flatten the array of posts arrays
//       }

//       // Combining all posts
//       const allPosts = [...userPosts, ...userFriendsPosts, ...userFollowedPagesPosts];
//       // Optional: Sort allPosts by createdAt if needed
//       allPosts.sort((a, b) => b.createdAt - a.createdAt);

//       res.json(allPosts);
//   } catch (error) {
//       console.error('Error fetching user posts:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.home = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from JWT token
    // Fetching user's own posts
    const userPosts = await Posts.find({ userId: userId }).sort({
      createdAt: -1,
    });

    // Initializing array to gather posts from friends and followed pages
    let userFriendsPosts = [];
    let userFollowedPagesPosts = [];

    // Fetching user's network information (friends and followed pages)
    const userNetwork = await Network.findOne({ userId: userId });

    // Fetching user's preferences
    const currentUser = await User.findOne({ userId: userId });
    const favoriteSports = currentUser.favoriteSports || [];

    // Fetching friends' posts
    if (userNetwork && userNetwork.friends.length > 0) {
      const friends = userNetwork.friends;
      // Using Promise.all to fetch all friends' posts concurrently for efficiency
      const friendsPostsPromises = friends.map(async (friendId) => {
        const originalPosts = await Posts.find({ userId: friendId }).sort({
          createdAt: -1,
        });
        const resharedPosts = await Posts.find({
          "shared.userId": friendId,
        }).sort({ createdAt: -1 });
        return [...originalPosts, ...resharedPosts];
      });
      const friendsPostsResults = await Promise.all(friendsPostsPromises);
      userFriendsPosts = friendsPostsResults.flat(); // Flatten the array of posts arrays
    }

    // Fetching posts from followed pages
    if (userNetwork && userNetwork.pages_following.length > 0) {
      const followedPages = userNetwork.pages_following;
      // Similarly using Promise.all for efficiency
      const pagesPostsPromises = followedPages.map((pageId) =>
        Posts.find({ userId: pageId }).sort({ createdAt: -1 })
      );
      const pagesPostsResults = await Promise.all(pagesPostsPromises);
      userFollowedPagesPosts = pagesPostsResults.flat(); // Flatten the array of posts arrays
    }

    // Combining all posts
    let allPosts = [
      ...userPosts,
      ...userFriendsPosts,
      ...userFollowedPagesPosts,
    ];
    // Enhancing the sorting logic to balance preference and recency
    const now = new Date();
    allPosts = allPosts
      .map((post) => {
        const ageInDays =
          (now - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
        const preferenceScore = favoriteSports.includes(post.postTitle)
          ? 100
          : 0; // Preference weight
        const recencyScore = Math.max(0, 30 - ageInDays); // Recency weight, loses value after 30 days
        const totalScore = preferenceScore + recencyScore;
        return {
          ...post._doc,
          score: totalScore,
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by total score

    res.json(
      allPosts.map((post) => {
        delete post.score; // Remove score from the response if not needed externally
        return post;
      })
    );
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle new post creation
exports.addNewPost = async (req, res) => {
  try {
    const { content, tag, author } = req.fields;
    const imageFile = req.files;
    if (!content || !tag || !author || !imageFile) {
      return res.status(400).json({ error: "Missing required data" });
    }
    const result = await cloudinary.uploader.upload(req.files.image.path);
    // Example: Create a new post document with image data
    const newPost = new Posts({
      postTitle: tag, // Convert to string if necessary
      postDescription: content,
      userId: author,
      image: {
        public_id: result.public_id,
        url: result.url,
      },
    });
    // Save the new post
    await newPost.save();
    // Find the current user
    const currentUser = await Network.findOne({ userId: author });

    // Check if the user exists
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Notify friends if they exist
    if (currentUser.friends && currentUser.friends.length > 0) {
      await Promise.all(
        currentUser.friends.map(async (friendId) => {
          // Create and save a new notification
          const notification = new Notification({
            userId: friendId,
            message: `Your friend ${author} shared a post.`,
            type: "Post_Shared",
            link: "", // Assuming the front end can handle this route to direct users to the new post
          });
          await notification.save();
        })
      );
    }

    // Return the created post data in the response
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating new post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.handleLike = async (req, res) => {
  try {
    const user = req.params.user;
    const postId = req.params.id;
    let updatedPost;
    // Check if user is already in likes array
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likesSet = new Set(post.likes);
    if (likesSet.has(user)) {
      // User is already in likes, so remove the user
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $pull: { likes: user } },
        { new: true }
      );
      actionTaken = "unliked";
    } else {
      // User is not in likes, so add the user
      updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: user } },
        { new: true }
      );
      actionTaken = "liked";
    }

    // Only send notification if a like was added
    if (actionTaken === "liked") {
      const notification = new Notification({
        userId: post.userId, // Assuming `userId` is the post owner
        message: `${user} liked your post.`,
        type: "Post_Liked",
        link: "", // Assuming there's a route to view the post
      });
      await notification.save();
    }

    // Send the updated post back as JSON response
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const user = req.params.user;
    const postId = req.params.id;
    const { content } = req.body;
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { content, commenter: user } },
      },
      {
        new: true,
      }
    );
    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const notification = new Notification({
      userId: updatedPost.userId, // Assuming `userId` is the post owner
      message: `${user} commented on your post.`,
      type: "Post_Commented",
      link: "", // Assuming there's a route to view the post
    });
    await notification.save();

    // Send the updated post back as JSON response
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.search = async (req, res) => {
  const { query, filter } = req.query;
  try {
    let searchPromises = [];
    let searchResults = { users: [], pages: [], posts: [] };

    const searchPattern = new RegExp(query, "i"); // Create a regex pattern for the search query

    if (filter === "All" || filter === "People") {
      searchPromises.push(
        User.find({
          $or: [
            { userId: new RegExp(query, "i") },
            { favoriteSports: new RegExp(query, "i") }, // Since tags is a single string
          ],
        })
      );
    }

    if (filter === "All" || filter === "Pages") {
      searchPromises.push(Page.find({ title: searchPattern }));
    }

    if (filter === "All" || filter === "Posts") {
      searchPromises.push(
        Posts.find({
          $or: [
            { userId: searchPattern },
            { postTitle: { $regex: searchPattern } }, // Since tags is a single string
          ],
        })
      );
    }

    const results = await Promise.all(searchPromises);

    if (filter === "All" || filter === "People") {
      searchResults.users = results[0];
    }
    if (filter === "All" || filter === "Pages") {
      searchResults.pages = filter === "All" ? results[1] : results[0];
    }
    if (filter === "All" || filter === "Posts") {
      searchResults.posts =
        filter === "All" ? results[2] : results[filter === "Pages" ? 1 : 0];
    }

    res.json(searchResults);
  } catch (error) {
    console.error("Error searching for content:", error);
    res.status(500).send("Error searching for content");
  }
};

exports.profile = async (req, res) => {
  const userId = req.params.userId; // this is the string representation of MongoDB's ObjectId
  try {
    // Assuming `userId` is the string representation of the ObjectId, use `_id` to fetch the details
    const userDetails = await User.findById(userId, "-password"); // Excludes the password field
  
    if (!userDetails) {
      return res.status(404).send("User not found");
    }

    res.json(userDetails);
  } catch (error) {
    // If there's an error, it could be due to an invalid ObjectId format
    console.error(`Error fetching user profile for _id ${userId}:`, error);
    res.status(500).send("Server error");
  }
};

exports.handleShare = async (req, res) => {
  try {
    const user = req.params.user;
    const postId = req.params.id;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const alreadyShared = post.shared.some((item) => item.userId === user);
    if (alreadyShared) {
      return res
        .status(400)
        .json({ error: "Post already shared by this user" });
    }
    const sharedPost = await Posts.findByIdAndUpdate(
      postId,
      { $addToSet: { shared: { userId: user } } },
      { new: true }
    );
    if (!sharedPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    const notification = new Notification({
      userId: post.userId, // Assuming `userId` is the post owner
      message: `${user} shared your post.`,
      type: "Post_Shared",
      link: "", // Assuming there's a route to view the post
    });
    await notification.save();
    res.status(201).json(sharedPost);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addNewPoll = async (req, res) => {
  try {
    const userId = req.userId;
    // const { question, options } = req.fields;
    const { question, options } = req.body;
    const newPoll = new Polls({
      question: question,
      options: options.map((option) => ({ text: option, voters: [] })), // Adjusted according to provided structure
      createdBy: userId,
    });
    // Save the new post
    await newPoll.save();
    // Find the current user
    const currentUser = await Network.findOne({ userId: userId });

    // Check if the user exists
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Notify friends if they exist
    if (currentUser.friends && currentUser.friends.length > 0) {
      await Promise.all(
        currentUser.friends.map(async (friendId) => {
          // Create and save a new notification
          const notification = new Notification({
            userId: friendId,
            message: `Your friend ${userId} posted a poll.`,
            type: "Poll_Posted",
            link: "", // Assuming the front end can handle this route to direct users to the new post
          });
          await notification.save();
        })
      );
    }

    // Return the created post data in the response
    res.status(201).json(newPoll);
  } catch (error) {
    console.error("Error creating new poll:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.getPolls = async (req, res) => {
//   try {
//     // Assuming you want to fetch all polls or implement some logic to select specific ones
//     const polls = await Polls.find().sort({ createdAt: -1 });
//     res.json(polls);
//   } catch (error) {
//     console.error("Error fetching polls:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.getPolls = async (req, res) => {
  try {
    // Decode the JWT token to get the userId
    const token = req.headers.authorization.split(' ')[1]; // Assumes Bearer token format
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const userNetwork = await Network.findOne({ userId: userId });
    if (!userNetwork || userNetwork.friends.length === 0) {
      return res.status(200).json([]);
    }

    const friendsPollsPromises = userNetwork.friends.map(friendId =>
      Polls.find({ createdBy: friendId }).sort({ createdAt: -1 })
    );

    const friendsPollsResults = await Promise.all(friendsPollsPromises);
    res.json(friendsPollsResults.flat());
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.handleVote =async(req,res) => {
//   try{
//     const userId = req.userId;
//     const pollId=req.params.id;
//     const { text } = req.body;
//     const updatedPost= await Posts.findByIdAndUpdate(pollId,{
//         $push:{options:{ text, voters:[{userId}] }}
//     }
//     ,{
//       new:true
//     });
//     if (!updatedPost) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     const notification = new Notification({
//       userId: updatedPost.userId, // Assuming `userId` is the post owner
//       message: `${user} voted on your poll.`,
//       type: "Poll_Voted",
//       link: '', // Assuming there's a route to view the post
//     });
//     await notification.save();

//     // Send the updated post back as JSON response
//     res.status(201).json(updatedPost);
//   }
//   catch(error){
//     console.error('Error updating poll:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.handleVote = async (req, res) => {
  try {
    const userId = req.userId; // Authentication middleware should set this
    const pollId = req.params.id;
    const { text } = req.body; // Text of the option being voted on

    // Retrieve the poll to ensure it exists and get the option to update
    const poll = await Polls.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if the user has already voted in this poll
    const hasVoted = poll.options.some(option => option.voters.includes(userId));
    if (hasVoted) {
      return res.status(403).json({ error: "You have already voted in this poll" });
    }

    // Find the index of the option to be updated
    const optionIndex = poll.options.findIndex(option => option.text === text);
    if (optionIndex === -1) {
      return res.status(404).json({ error: "Option not found" });
    }

    // Update the voters array for the specific option
    const updatedPoll = await Polls.findOneAndUpdate(
      { _id: pollId, [`options.${optionIndex}.text`]: text },
      { $push: { [`options.${optionIndex}.voters`]: userId } },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ error: "Failed to update the poll" });
    }
    // Assuming you have a way to fetch the user's name from your user management system
    const user = "The user's name"; // Placeholder, replace with actual user name retrieval logic

    // Create and save the notification
    const notification = new Notification({
      userId: userId,
      message: `${user} voted on your poll.`,
      type: "Poll_Voted",
      link: "", // Provide a link to the poll if you have one
    });
    await notification.save();
    // Send the updated poll back as a JSON response
    res.status(200).json(updatedPoll);
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint to fetch polls created by the current user
exports.fetchPolls = async (req, res) => {
  try {
      const polls = await Polls.find({ createdBy: req.params.userId });
      res.json(polls);
  } catch (error) {
      console.error('Failed to fetch user polls:', error);
      res.status(500).json({ message: 'Failed to fetch user polls' });
  }
};

// Endpoint to download poll results
// exports.downloadPolls = async (req, res) => {
//   try {
//       const poll = await Polls.findById(req.params.pollId);
//       if (!poll) {
//           return res.status(404).json({ message: 'Poll not found' });
//       }

//       // Generate CSV or any other format for download
//       const csvData = generateCSV(poll);
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', `attachment; filename="poll-${poll.question}-results.csv"`);
//       res.send(csvData);
//   } catch (error) {
//       console.error('Error downloading poll results:', error);
//       res.status(500).json({ message: 'Error downloading poll results' });
//   }
// };

// function generateCSV(poll) {
//   // Check for poll validity
//   if (!poll || !poll.options) {
//     throw new Error('Invalid poll data');
//   }
  
//   const headers = 'Option,Count\n';
//   const rows = poll.options.map(opt => {
//     const text = `"${opt.text.replace(/"/g, '""')}"`; // Escape double quotes and wrap text in double quotes
//     const voteCount = opt.voters.length; // Count the number of voters for each option
//     return `${text},${voteCount}`;
//   }).join('\n');
  
//   return headers + rows;
// }

exports.downloadPolls = async (req, res) => {
  try {
    const poll = await Polls.findById(req.params.pollId);
    if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
    }

    // Generate CSV data
    const csvData = generateCSV(poll);
    
    // Sanitize the poll question to remove characters that are not allowed in filenames
    const filename = sanitizeFilename(poll.question);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}-results.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error downloading poll results:', error);
    res.status(500).json({ message: 'Error downloading poll results' });
  }
};

function sanitizeFilename(text) {
  return text.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Replace non-alphanumeric characters with underscores
}

function generateCSV(poll) {
  // Check for poll validity
  if (!poll || !poll.options) {
    throw new Error('Invalid poll data');
  }
  
  // Escape the question for CSV and use it as a header
  const escapedQuestion = `"${poll.question.replace(/"/g, '""')}"`;
  const headers = `Poll Question: ${escapedQuestion}\nOption,Count\n`;
  
  const rows = poll.options.map(opt => {
    const text = `"${opt.text.replace(/"/g, '""')}"`; // Escape double quotes in option text
    const voteCount = opt.voters.length; // Count the number of voters for each option
    return `${text},${voteCount}`;
  }).join('\n');
  
  return headers + rows;
}