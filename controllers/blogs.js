const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');

const Blog = require('../models/blogs');
const User = require('../models/users');

blogsRouter.get('/', async (request, response) => {
  const blogList = await Blog.find({}).populate('user', { blogs: 0 });

  response.json(blogList);
});

blogsRouter.post('/', async (request, response, next) => {
  try {
    const auth = request.get('authorization');
    const token = (auth && auth.startsWith('Bearer '))
      ? auth.replace('Bearer ', '')
      : null;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) return response.status(401).json({ error: 'invalid token' });

    const user = await User.findById(decodedToken.id);

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
