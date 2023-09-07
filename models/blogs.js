const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: {
    type: Number,
    default: 0,
  },
});

blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    const id = ret._id.toString();
    delete ret._id;
    return { ...ret, id };
  },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
