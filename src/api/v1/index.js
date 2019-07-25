const router = require('express').Router()

router.use('/players', require('./players'))

module.exports = router