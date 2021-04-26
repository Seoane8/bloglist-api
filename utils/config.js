require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

module.exports = {
  PORT,
  MONGODB_URI,
  JWT_SECRET_KEY
}
