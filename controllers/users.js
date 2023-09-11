const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/users');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    username,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
