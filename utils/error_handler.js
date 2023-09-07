const errorHandler = (error, req, res, next) => {
  console.log(`reached error handler with error ${error.name}`);

  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  return next(error);
};

module.exports = errorHandler;
