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

test('blog posts have unique identifier named "id"', async () => {
  const blogList = await api.get('/api/blogs');

  expect(blogList.body[0].id).toBeDefined();
});

test('POST request successfully stores a new blog post in the db', async () => {
  const newPost = {
    title: 'New post!',
    author: 'Me',
    url: 'https://blogpost.com/',
    likes: 1,
  };

  const addedPost = await api
    .post('/api/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const updatedList = await api.get('/api/blogs');

  expect(updatedList.body).toHaveLength(helper.initialBlogs.length + 1);
  expect(updatedList.body).toContainEqual(addedPost.body);
});

afterAll(async () => {
  console.log('closing mongoose connection');
  mongoose.connection.close();
});
