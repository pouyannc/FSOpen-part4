const blogsRouter = require('express').Router();

const Blog = require('../models/blogs');

blogsRouter.get('/', async (request, response) => {
  const blogList = await Blog.find({});

  response.json(blogList);
});

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body);

  const addedBlog = await blog.save();

  response.status(201).json(addedBlog);
});

module.exports = blogsRouter;
