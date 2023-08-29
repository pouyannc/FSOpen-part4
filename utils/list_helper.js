const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((tot, blog) => tot + blog.likes, 0);

const favoriteBlog = (blogs) => {
  if (blogs.length < 1) return {};
  return blogs.reduce((fav, blog) => (
    blog.likes > fav.likes ? blog : fav
  ), { likes: -1 });
};

const mostBlogs = (blogs) => {
  const tally = {};
  blogs.forEach((b) => {
    if (tally[b.author]) tally[b.author] += 1;
    else tally[b.author] = 1;
  });
  const res = {};
  Object.keys(tally).forEach((k) => {
    if (Object.keys(res).length < 1 || tally[k] > res.blogs) {
      res.author = k;
      res.blogs = tally[k];
    }
  });
  return res;
};

const mostLikes = (blogs) => {
  const tally = {};
  blogs.forEach((b) => {
    if (tally[b.author] !== undefined) tally[b.author] += b.likes;
    else tally[b.author] = b.likes;
  });
  const res = {};
  Object.keys(tally).forEach((k) => {
    if (Object.keys(res).length < 1 || tally[k] > res.likes) {
      res.author = k;
      res.likes = tally[k];
    }
  });
  return res;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
