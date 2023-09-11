const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blogs');
const User = require('../models/users');

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

describe('POST request', () => {
  const newPost = {
    title: 'New post!',
    author: 'Me',
    url: 'https://blogpost.com/',
    likes: 1,
  };

  test('successfully stores a valid blog post in the db', async () => {
    const addedPost = await api
      .post('/api/blogs')
      .send(newPost)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const updatedList = await helper.blogsInDb();

    expect(updatedList).toHaveLength(helper.initialBlogs.length + 1);
    expect(updatedList).toContainEqual(addedPost.body);
  });

  const postMissingLikes = {
    title: 'post does not have likes property',
    author: 'Me',
    url: 'https://blogpost.com/',
  };

  test('with empty likes field defaults to 0 likes', async () => {
    const addedPost = await api
      .post('/api/blogs')
      .send(postMissingLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(addedPost.body.likes).toBeDefined();
  });

  const postMissingRequired = {
    author: 'Me',
  };

  test('without title or request field returns status 400 and the blog does not get added', async () => {
    await api
      .post('/api/blogs')
      .send(postMissingRequired)
      .expect(400);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Deleting a blog post', () => {
  test('using a valid id returns status code 204 and the blog is no longer in the database', async () => {
    const startingBlogs = await helper.blogsInDb();
    const blogToDelete = startingBlogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const endingBlogs = await helper.blogsInDb();

    expect(endingBlogs).toHaveLength(startingBlogs.length - 1);

    const ids = endingBlogs.map((b) => b.id);

    expect(ids).not.toContain(blogToDelete.id);
  });
});

describe('Updating a blog post', () => {
  const blogUpdate = {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 19,
  };

  test('successfully updates the first blog post in the db to have 19 likes', async () => {
    const startingBlogs = await helper.blogsInDb();
    const blogToUpdate = startingBlogs[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const updatedBlogs = await helper.blogsInDb();
    expect(updatedBlogs[0].likes).toBe(19);
  });
});

describe('Creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('with a unique username successfully saves the new user', async () => {
    const newUser = {
      username: 'person',
      name: 'seb',
      password: 'secret',
    };

    const startingUsers = await helper.usersInDb();

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const endingUsers = await helper.usersInDb();
    expect(endingUsers).toHaveLength(startingUsers.length + 1);

    const usernames = endingUsers.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });
});

afterAll(async () => {
  console.log('closing mongoose connection');
  mongoose.connection.close();
});
