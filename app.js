require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const loginRouter = require('./routes/login');
const forgetPasswordRouter = require("./routes/forgetPassword");
const homepageRouter = require("./routes/homepage")
const userModel = require("./model/User"); 


const app = express();

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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", loginRouter);
app.use("/", forgetPasswordRouter);
//app.use("/", homepageRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.listen(3000, () => console.log("Server is running on port 3000"));
