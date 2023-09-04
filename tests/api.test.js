const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blogs');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((b) => new Blog(b));
  const promiseArray = blogObjects.map((b) => b.save());
  await Promise.all(promiseArray);
});

test('bloglist is returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('bloglist returns the correct number of items', async () => {
  const blogList = await api.get('/api/blogs');

  expect(blogList.body).toHaveLength(helper.initialBlogs.length);
});

afterAll(async () => {
  console.log('closing mongoose connection');
  mongoose.connection.close();
});
