const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const postSchema = new Schema({

  postTitle: { type: String, required: true },
  postDescription: { type: String, required: true },
  userId: { type: String, ref: "User" },
  image: { public_id: {
    type: String,
    required: true
},
url: {
    type: String,
    required: true
} }
}, { timestamps: true }
)


module.exports = mongoose.model("posts", postSchema);