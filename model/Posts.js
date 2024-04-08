const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: { type: String, required: true },
    commenter: { type: String, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  });

  const repostSchema = new Schema({
    postId: { type: String, ref: "posts", required: true },
    userId: { type: String, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  })

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
} },
likes:[{type:String,ref:"User"}],
comments:[commentSchema],
shared:[repostSchema]
}, { timestamps: true }
)


module.exports = mongoose.model("posts", postSchema);