const {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
} = require('../utils/list_helper');

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(totalLikes([])).toBe(0);
  });

  test('of list with one blog equals likes of that', () => {
    expect(totalLikes([blogs[0]])).toBe(7);
  });

  test('of a larger list of blogs is calculated correctly', () => {
    expect(totalLikes(blogs)).toBe(36);
  });
});

describe('the favorite blog', () => {
  test('is an empty object if there an empty array is given', () => {
    expect(favoriteBlog([])).toEqual({});
  });

  test('is the blog with most likes when given an array of multiple blogs', () => {
    expect(favoriteBlog(blogs)).toEqual({
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
    });
  });
});

describe('the author with most blogs', () => {
  test('returns empty object if no blogs given', () => {
    expect(mostBlogs([])).toEqual({});
  });

  test('returns an object with the author and the number of blogs when given several blogs', () => {
    expect(mostBlogs(blogs)).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('the author with most total likes', () => {
  test('returns empty array if no blogs given', () => {
    expect(mostLikes([])).toEqual({});
  });

  test('returns an object with the author and the number of likes', () => {
    expect(mostLikes(blogs)).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
