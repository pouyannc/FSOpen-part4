const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
