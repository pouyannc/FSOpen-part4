const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const logger = require('./utils/logger');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const config = require('./utils/config');
const errorHandler = require('./utils/error_handler');

const app = express();

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('error connecting to MongoDB ', err);
  });

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

module.exports = app;
