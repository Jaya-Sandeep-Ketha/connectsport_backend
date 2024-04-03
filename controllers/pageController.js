const Page = require('../model/page');
const Notification = require('../model/Notification'); // Assuming this exists
const Posts=require('../model/Posts');

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

  try {
    const page = await Page.findById(req.params.id);
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

    res.status(200).send({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
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





// Donate endpoint (Mock)
exports.donate = async (req, res) => {
  // Redirect user to a mock payment portal or integrate with a real payment API
  res.status(200).send({ message: 'Redirecting to payment...', paymentUrl: 'https://mockpayment.com' });
};
