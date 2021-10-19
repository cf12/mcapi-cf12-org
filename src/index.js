const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require('node-fetch')
const redis = require('redis')
const compression = require('compression')
const Bluebird = require('bluebird')

// Promisifiy w/ Bluebird
fetch.Promise = Bluebird
Bluebird.promisifyAll(redis)

const REDIS_URL = 'redis://redis'
const PORT = 8080

const app = express()
const redisClient = redis.createClient(REDIS_URL)

// Globals
global.rClient = redisClient
global.Promise = Bluebird

// Enable CORS Preflight
app.options('*', cors())

// Express Middleware
app.use(helmet())
app.use(cors())
app.use(compression())

// Load custom middleware
app.use((req, res, next) => {
  req.redis = redisClient
  next()
})

app.use('/api/v1/', require('./api/v1/'))


app.listen(PORT, () => {
  console.log('[i] Server started on port: ' + PORT)
})
