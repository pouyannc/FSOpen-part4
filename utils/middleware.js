const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');

  const token = (auth && auth.startsWith('Bearer '))
    ? auth.replace('Bearer ', '')
    : null;

  req.token = token;

  next();
};

module.exports = { tokenExtractor };
