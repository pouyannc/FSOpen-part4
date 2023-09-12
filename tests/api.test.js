const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blogs');
const User = require('../models/users');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password', 10);
  const user = new User({ username: 'root', passwordHash });

  await user.save();

  await Blog.deleteMany({});

  const currentUsers = await User.find({});
  const uid = currentUsers[0]._id;

  const blogObjects = helper.initialBlogs.map((b) => new Blog({ ...b, user: uid }));
  const promiseArray = blogObjects.map((b) => b.save());
  await Promise.all(promiseArray);

  const blogs = await helper.blogsInDb();
  blogs.forEach((b) => {
    currentUsers[0].blogs = currentUsers[0].blogs.concat(b.id);
  });
  await currentUsers[0].save();
});

describe('GET request for users', () => {
  test('returns correct number of entries as JSON successfully and contains blogs info', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(users.body).toHaveLength(1);

    expect(users.body[0].blogs[0]).toBeDefined();
    expect(users.body[0].blogs[0].title).toEqual(helper.initialBlogs[0].title);
  });
});

describe('Creating a new user', () => {
  test('with a valid username and password successfully saves the new user', async () => {
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

  test('with an invalid username or password returns the appropriate status and error', async () => {
    const shortPassUser = {
      username: 'person',
      name: 'seb',
      password: 'se',
    };

    const noPassUser = {
      username: 'person',
      name: 'seb',
    };

    const shortNameUser = {
      username: 'p',
      name: 'seb',
      password: 'secret',
    };

    const startingUsers = await helper.usersInDb();

    let res;
    res = await api
      .post('/api/users')
      .send(shortPassUser)
      .expect(400);
    expect(res.body.error).toBe('password is too short');

    res = await api
      .post('/api/users')
      .send(noPassUser)
      .expect(400);
    expect(res.body.error).toBe('password is required');

    res = await api
      .post('/api/users')
      .send(shortNameUser)
      .expect(400);
    expect(res.body.error).toBe('username is too short');

    const endingUsers = await helper.usersInDb();
    expect(endingUsers).toHaveLength(startingUsers.length);
  });
});



describe('GET request for blogs', () => {
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

  test('entries contain user info', async () => {
    const blogList = await api.get('/api/blogs');

    const usernames = blogList.body.map((b) => b.user.username);
    expect(usernames).toContain('root');

    expect(blogList.body[0].user.blogs).not.toBeDefined();
  });
});

describe('POST request', () => {
  const newPost = {
    title: 'New post!',
    author: 'Me',
    url: 'https://blogpost.com/',
    likes: 1,
  };

  test('successfully stores a valid blog post in the db', async () => {
    const users = await helper.usersInDb();
    const user = users[0];
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET);

    const addedPost = await api
      .post('/api/blogs')
      .send(newPost)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const updatedList = await helper.blogsInDb();

    expect(updatedList).toHaveLength(helper.initialBlogs.length + 1);

    const blogTitles = updatedList.map((b) => b.title);
    expect(blogTitles).toContain(addedPost.body.title);
  });

  const postMissingLikes = {
    title: 'post does not have likes property',
    author: 'Me',
    url: 'https://blogpost.com/',
  };

  test('with empty likes field defaults to 0 likes', async () => {
    const users = await helper.usersInDb();
    const user = users[0];
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET);

    const addedPost = await api
      .post('/api/blogs')
      .send(postMissingLikes)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(addedPost.body.likes).toBeDefined();
  });

  const postMissingRequired = {
    author: 'Me',
  };

  test('without title or request field returns status 400 and the blog does not get added', async () => {
    const users = await helper.usersInDb();
    const user = users[0];
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET);

    await api
      .post('/api/blogs')
      .send(postMissingRequired)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  });

  test('without a token returns status 401 and blog does not get added', async () => {
    await api
      .post('/api/blogs')
      .send(newPost)
      .expect(401);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Deleting a blog post', () => {
  test('using a valid id returns status code 204 and the blog is no longer in the database', async () => {
    const users = await helper.usersInDb();
    const user = users[0];
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET);

    const startingBlogs = await helper.blogsInDb();
    const blogToDelete = startingBlogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204);

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

afterAll(async () => {
  console.log('closing mongoose connection');
  mongoose.connection.close();
});
