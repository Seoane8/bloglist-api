const { Blog } = require('../models')

const {
  api,
  initialBlogs,
  newBlog,
  ...helper
} = require('./testHelper')

beforeEach(async () => await Blog.deleteMany({}))

describe('GET all blogs', () => {
  test('when there are NO blogs, return empty JSON array', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(0)
  })

  test('when there are blogs, return the correct number of them in JSON', async () => {
    await helper.addBlogs()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('returned identifier is \'id\' instead of \'_id\'', async () => {
    await helper.addBlogs()

    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
    expect(response.body[0]._id).toBeUndefined()
  })
})

describe('POST blog', () => {
  test('a well formed blog is created correctly', async () => {
    await helper.addBlogs()

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject(newBlog)

    const numOfBlogs = await helper.countBlogs()
    expect(numOfBlogs).toBe(initialBlogs.length + 1)

    const savedBlog = await helper.findBlog({ title: newBlog.title })
    expect(savedBlog).toMatchObject(newBlog)
  })

  test('a blog without likes parameter is created with 0 likes', async () => {
    const { likes, ...blogToAdd } = newBlog
    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(201)

    const savedBlog = await helper.findBlog({ title: newBlog.title })
    expect(savedBlog.likes).toBe(0)
  })

  test('when try POST blog without title or url, return bad request', async () => {
    const { title, ...blogWithoutTitle } = newBlog
    const { url, ...blogWithoutUrl } = newBlog

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .expect(400)
  })
})

describe('DELETE blog', () => {
  test('when \'id\' is valid, delete note', async () => {
    await helper.addBlogs()

    const blogToDelete = await helper.findBlog()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogDeletedFound = await helper.findBlog({ title: blogToDelete.title })
    expect(blogDeletedFound).toBeNull()
  })

  test('when \'id\' is invalid, bad request', async () => {
    await helper.addBlogs()

    await api
      .delete('/api/blogs/1234')
      .expect(400)

    const numOfBlogs = await helper.countBlogs()
    expect(numOfBlogs).toBe(initialBlogs.length)
  })

  test('when \'id\' not exist, not found', async () => {
    const inexistentId = '60451827152dc22ad768f442'
    await helper.addBlogs()

    await api
      .delete(`/api/blogs/${inexistentId}`)
      .expect(404)

    const numOfBlogs = await helper.countBlogs()
    expect(numOfBlogs).toBe(initialBlogs.length)
  })
})

afterAll(helper.closeConnection)
