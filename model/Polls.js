const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pollSchema = new mongoose.Schema({
    question: {
      type: String,
      required: true,
    },
    options: [{
      text: {
        type: String,
        required: true,
      },
      voters: [{
        type: String,
        ref: 'User',
      }],
    }],
    createdBy: { type: String, ref: "User", required: true },
  });
  
  const Poll = mongoose.model('polls', pollSchema);
  
  module.exports = Poll;