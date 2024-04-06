const Page = require('../model/page');
const Notification = require('../model/Notification'); // Assuming this exists
const Posts=require('../model/Posts');
const Network=require('../model/Network');
const UserModel = require('../model/User');
const nodemailer = require('nodemailer');

// Fetch all pages
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find({}); // Fetch all pages without any condition
    res.status(200).json(pages); // Send the fetched pages as a response
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch pages', error: error.message });
  }
};

// Fetch a single page by ID
exports.getPageById = async (req, res) => {
  try {
    const pageId = req.params.id; // Extract page ID from the request parameters
    const page = await Page.findById(pageId); // Find the page by ID

    if (!page) {
      return res.status(404).send({ message: 'Page not found' });
    }

    res.status(200).json(page); // Send the found page as a response
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch the page', error: error.message });
  }
};


exports.createPage = async (req, res) => {
  console.log('Received data:', req.body);
  try {
    console.log('Inside try block');
    const newPageData = {
      title: req.body.title,
      description: req.body.description,
      createdBy: req.body.createdBy, // Assuming you have middleware to populate req.user
      type: req.body.type,
      askForDonations: req.body.askForDonations || false,
      donationMobile: req.body.donationMobile || '',
      contactNumber: req.body.contactNumber || '',
    };

    if (req.body.type === 'Event') {
      newPageData.date = req.body.date;
      newPageData.venue = req.body.venue;
    }

    const page = new Page(newPageData);
    await page.save();
    console.log('Page saved successfully:', page);
    res.status(201).send(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(400).send(error.message);
  }
};

// Follow/Unfollow page endpoint
exports.follow_unfollow = async (req, res) => {
  const { userId } = req.body;
  const pageId = req.params.id;

  try {
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).send({ message: 'Page not found' });
    }

    const isFollowing = page.followers && page.followers.includes(userId);
    if (isFollowing) {
      // User is currently a follower, remove them
      page.followers = page.followers.filter(followerId => followerId !== userId);
    } else {
      // User is not a follower, add them
      page.followers = page.followers ? [...page.followers, userId] : [userId];
    }

    await page.save();

    // Update Network model
    let userNetwork = await Network.findOne({ userId: userId });
    if (!userNetwork) {
      userNetwork = new Network({ userId, pages_following: [] });
    }

    if (isFollowing) {
      // If the user was following the page, remove it from their list
      userNetwork.pages_following = userNetwork.pages_following.filter(pid => pid !== pageId);
    } else {
      // If the user was not following the page, add it to their list
      if (!userNetwork.pages_following.includes(pageId)) {
        userNetwork.pages_following.push(pageId);
      }
    }

    await userNetwork.save();

    res.status(200).send({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
};

exports.sharePage = async (req, res) => {
  const { userId, pageId } = req.body;
  console.log("Request to share page received", { userId, pageId }); // Log incoming request data

  const baseURL = process.env.FRONTEND_APP_URL || 'https://yourapp.com'; 
  const pageUrl = `${baseURL}/pages/${pageId}`;
  console.log("Constructed page URL:", pageUrl); // Log the constructed URL

  try {
    const page = await Page.findById(pageId);
    if (!page) {
      console.log("Page not found for ID:", pageId); // Log when page is not found
      return res.status(404).send({ message: 'Page not found' });
    }

    const userNetwork = await Network.findOne({ userId: userId });
    if (!userNetwork || !userNetwork.friends || userNetwork.friends.length === 0) {
      console.log("No friends or network found for user:", userId); // Log when no network/friends found
      return res.status(404).send({ message: 'No friends to share with or network not found' });
    }

    console.log("Sharing with friends:", userNetwork.friends); // Log the friends list
    await Promise.all(userNetwork.friends.map(async (friendId) => {
      console.log("Creating notification for friend ID:", friendId); // Log the friend ID being notified
      const notification = new Notification({
        userId: friendId,
        message: `Your friend ${userId} shared a page with you. Click here to view: ${pageUrl}`,
        type: "Page_Shared",
        link: pageUrl,
      });
      await notification.save();
    }));

    console.log("Page shared successfully with all friends.");
    res.status(200).send({ message: 'Page shared successfully with friends.' });
  } catch (error) {
    console.error('Error sharing page with friends:', error);
    res.status(500).send({ message: 'Failed to share the page with friends', error: error.message });
  }
};


// Post content and notify followers
exports.createPost = async (req, res) => {
  // This would involve adding content to the page and sending notifications
  // Pseudo-code, implement according to your application's structure
  const followers = page.followers; // Assume you get the followers list
  followers.forEach(follower => {
    // Create and send a notification for each follower
    const notification = new Notification({
      // Notification details
    });
    notification.save();
  });
  res.status(200).send({ message: 'Content posted and notifications sent' });
};


// Fetch all pages
exports.getPosts = async (req, res) => {
  try {
    console.log('Fetching posts for pageId:', req.params.id);
    const pageId = req.params.id; // Extracting pageId from the URL

    // Find posts related to the pageId, sorted by createdAt in descending order
    const pagePosts = await Posts.find({ userId: pageId }).sort({ createdAt: -1 });
    console.log('Found posts:', pagePosts);

    // Check if posts are found
    if (pagePosts.length === 0) {
      return res.status(200).json({ message: 'No posts found for this page.', posts: [] });
    }

    // If posts are found, send them back in response
    res.json(pagePosts);
  } catch (error) {
    console.error('Error fetching page posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "connectsport17@gmail.com",
    pass: "mikz brrc wcqo onvf",
  },
});

exports.donate = async (req, res) => {
  const { userId, pageId, cardDetails } = req.body;
  let { amount } = req.body;
  console.log(`Processing donation from user ${userId} for page ${pageId} with amount ${amount}`);

  try {
    const user = await UserModel.findOne({userId : userId});
    const page = await Page.findById(pageId);

    if (!user) {
      console.error(`User ${userId} not found.`);
      return res.status(404).send({ message: 'User not found' });
    }
    if (!page) {
      console.error(`Page ${pageId} not found.`);
      return res.status(404).send({ message: 'Page not found' });
    }

    // Convert amount to an integer
    amount = parseInt(amount, 10);
    // Validate conversion success
    if (isNaN(amount)) {
      console.error('Invalid donation amount:', amount);
      return res.status(400).send({ message: 'Invalid donation amount' });
    }

    console.log(`Adding donation to page ${pageId}. Current total before addition: ${page.totalDonations}`);
    page.donations = page.donations || [];
    page.totalDonations = (parseInt(page.totalDonations, 10) || 0) + amount; // Ensure totalDonations is treated as an integer

    const donation = { username: user.userId, amount };
    page.donations.push(donation);

    await page.save();
    console.log(`Donation added. New total donations for page ${pageId}: ${page.totalDonations}`);

    // Assuming transporter is defined earlier and configured properly
    const mailOptions = {
      from: 'yourEmail@gmail.com', // Replace with actual sender email
      to: user.email,
      subject: 'Donation Confirmation',
      html: `<p>Thank you for your donation of $${amount} to ${page.title}.</p>`,
    };

    const emailResult = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} with result:`, emailResult);

    res.send({ message: 'Donation processed and confirmation email sent successfully.' });
  } catch (error) {
    console.error('Donation processing failed:', error);
    res.status(500).send({ message: 'Failed to process donation', error });
  }
};