const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require('node-fetch')
const redis = require('redis')
const Bluebird = require('bluebird')

// Promisifiy w/ Bluebird
fetch.Promise = Bluebird
Bluebird.promisifyAll(redis)

const REDIS_URL = process.env.REDISCLOUD_URL || 'redis://localhost:6379'
const PORT = process.env.PORT || 3002

const app = express()
const redisClient = redis.createClient(REDIS_URL, { no_ready_check: true })

// Globals
global.rClient = redisClient
global.Promise = Bluebird

// Enable CORS Preflight
app.options('*', cors())

// Express Middleware
app.use(helmet())
app.use(cors())

// Load custom middleware
app.use((req, res, next) => {
  req.redis = redisClient
  next()
})

app.use('/api/v1/', require('./api/v1/'))


app.listen(PORT, () => {
  console.log('[i] Server started on port: ' + PORT)
})