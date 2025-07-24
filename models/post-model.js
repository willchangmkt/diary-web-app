// models > post-model.js

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
  },
   day: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  weather: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  author: String,
});

module.exports = mongoose.model("Post", postSchema);
