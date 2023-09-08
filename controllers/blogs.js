const blogsRouter = require('express').Router();

const Blog = require('../models/blogs');

blogsRouter.get('/', async (request, response) => {
  const blogList = await Blog.find({});

  response.json(blogList);
});

blogsRouter.post('/', async (request, response, next) => {
  try {
    const blog = new Blog(request.body);
    const addedBlog = await blog.save();
    response.status(201).json(addedBlog);
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  const blogId = request.params.id;

  await Blog.findByIdAndRemove(blogId);

  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true });

  response.json(updatedBlog);
});

module.exports = blogsRouter;
