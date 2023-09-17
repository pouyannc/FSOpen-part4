const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogList = await Blog.find({}).populate('user', { blogs: 0 });

  response.json(blogList);
});

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const { user } = request;

    const blog = new Blog({
      ...request.body,
      user: user.id,
    });

    const addedBlog = await blog.save();
    user.blogs = user.blogs.concat(addedBlog._id);
    await user.save();

    response.status(201).json(addedBlog);
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blogId = request.params.id;

  const blog = await Blog.findById(blogId);

  if (request.user.id !== blog.user.toString()) return response.status(401).json({ error: 'not authorized to delete' });

  await Blog.findByIdAndRemove(blogId);

  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true });

  response.json(updatedBlog);
});

module.exports = blogsRouter;
