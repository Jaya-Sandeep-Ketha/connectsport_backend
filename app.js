require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const loginRouter = require('./routes/loginRouter');
const forgetPasswordRouter = require("./routes/forgetPassword");
const homepageRouter = require("./routes/homepageRouter")
const userModel = require("./model/User"); 
const settings = require("./routes/settingsRouter");
const networkRoutes = require('./routes/networkRoutes');
const messagingRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes'); // The path might differ based on your file structure
const friendsRoutes = require('./routes/friendsRoutes');
const notificationsRoutes = require('./routes/notificationRouter');
const pageRoutes = require('./routes/pageRouter');



const app = express();
const PORT = process.env.PORT || 3000; // Use the port provided by the environment variable PORT, or default to 3000

// console.log(process.env.MONGODB_URI); // Remove after testing
// console.log(process.env.JWT_SECRET); // Remove after testing

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

<<<<<<< HEAD
// app.use(cors({
//   origin: 'https://main--connectsport.netlify.app'
// }));
=======
>>>>>>> 2a189dd938030823ebea7fd8037ff292c4022698
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", loginRouter);
app.use("/", forgetPasswordRouter);
app.use("/", homepageRouter);
app.use("/", settings);
app.use("/", messagingRoutes);
app.use("/", networkRoutes);
app.use("/", groupRoutes);
app.use("/", friendsRoutes);
app.use("/", notificationsRoutes);
app.use("/", pageRoutes);

// app.listen(3000, () => console.log("Server is running on port 3000"));
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});