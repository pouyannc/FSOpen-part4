const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/users');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs');

  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (password && password.length < 3) return response.status(400).json({ error: 'password is too short' });

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  const user = new User({
    name,
    username,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
