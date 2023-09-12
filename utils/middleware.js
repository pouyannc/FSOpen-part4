const jwt = require('jsonwebtoken');
const User = require('../models/users');

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');

  const token = (auth && auth.startsWith('Bearer '))
    ? auth.replace('Bearer ', '')
    : null;

  req.token = token;

  next();
};

const userExtractor = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!decodedToken.id) return res.status(400).json({ error: 'invalid token' });

  const user = await User.findById(decodedToken.id);

  req.user = user;

  next();
};

module.exports = { tokenExtractor, userExtractor };
