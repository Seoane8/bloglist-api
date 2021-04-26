const blogsRouter = require('express').Router()
const { Blog, User } = require('../models')
const { middleware: { payloadExtractor } } = require('../utils')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { blogs: 0 })

  response.json(blogs)
})

blogsRouter.post('/', payloadExtractor, async (request, response) => {
  const { id } = request.payload
  const user = await User.findById(id)

  if (!user) return response.status(401).json({ error: 'invalid token' })

  const newBlog = new Blog({ user: user._id, ...request.body })
  const savedBlog = await newBlog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deletedBlog = await Blog.findByIdAndDelete(id)

  if (!deletedBlog) return response.status(404).end()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const blog = request.body

  const updatedBlog = await Blog
    .findByIdAndUpdate(
      id,
      blog,
      { new: true, runValidators: true })

  if (!updatedBlog) return response.status(404).end()
  response.json(updatedBlog)
})

module.exports = blogsRouter
