require('express-async-errors')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const controllers = require('./controllers')
const { config, logger, middleware } = require('./utils')

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => logger.info('Database connected'))
  .catch(err => logger.error(`Error connecting to database: ${err.message}`))

const app = express()
  .use(cors())
  .use(express.json())
  .use(middleware.requestLogger)
  .use(middleware.tokenExtractor)

  .use('/api/blogs', controllers.blogs)
  .use('/api/users', controllers.users)
  .use('/api/login', controllers.login)

if (config.IS_TEST_ENV) {
  app.use('/api/testing', controllers.testing)
}

app
  .use(middleware.unknownEndpoint)
  .use(middleware.errorHandler)

module.exports = app
