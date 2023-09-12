const errorHandler = (error, req, res, next) => {
  console.log(`reached error handler with error ${error}`);

  if (error.name === 'ValidationError') {
    const errMessage = error.message.split(':')[2].trim();
    return res.status(400).send({ error: errMessage });
  }
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: error.message });
  }

  return next(error);
};

module.exports = errorHandler;
