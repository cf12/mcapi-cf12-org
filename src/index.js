const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require('node-fetch')
const redis = require('redis')
const Bluebird = require('bluebird')

const REDIS_PORT = process.env.REDISCLOUD_URL || 6379
const PORT = process.env.PORT || 3002

const app = express()
const redisClient = redis.createClient('redis://192.168.99.100:' + REDIS_PORT)

// Promisifiy w/ Bluebird
fetch.Promise = Bluebird
Bluebird.promisifyAll(redis)

// Globals
global.rClient = redisClient
global.Promise = Bluebird

// Enable CORS Preflight
app.options('*', cors()) 

// Express Middleware
app.use(helmet())
app.use(cors())

// Load Redis client as middleware
app.use((req, res, next) => {
  req.redis = redisClient
  next()
})

app.use('/api/v1/', require('./api/v1/'))


app.listen(PORT, () => {
  console.log('[i] Server started on port: ' + PORT)
})