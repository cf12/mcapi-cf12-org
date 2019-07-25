const router = require('express').Router()
const fetch = require('node-fetch')

const uuidRegex = /[0-9a-fA-F]{8}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{12}/

router.get('/:uuid', (req, res) => {
  let { uuid } = req.params
  
  if (!uuidRegex.test(uuid)) {
    res.status(400)
    res.json({
      error: 'Invalid UUID'
    })
    return
  }

  uuid = uuid.replace(/-/g, '')

  const key = `players:${uuid}`
  const duration = 20

  rClient.getAsync(key)
    .then(cachedData => {
      if (cachedData) {
        console.log('[i] Cached!')
        res.status(200)
        res.json(JSON.parse(cachedData))
        return
      } 

      fetch(`https://api.mojang.com/user/profiles/${uuid}/names`).then(fetchRes => {
        console.log('[i] Fetched!')

        // TODO: Test if res status 204 triggers too many reqs
        if (fetchRes.status === 204) {
          res.status(400)
          res.json({
            error: 'No player data found'
          })
          return
        }

        fetchRes.json().then(data => {
          rClient.setex(key, duration, JSON.stringify(data))
          res.status(200)
          res.json(data)
        })
      })
    })
})

module.exports = router