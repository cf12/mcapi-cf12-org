const router = require('express').Router()
const User = require('../../classes/Player')

const uuidRegex = /[0-9a-fA-F]{8}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{4}\-?[0-9a-fA-F]{12}/

function getCacheInfo (cacheTime) {
  return {
    _source: (cacheTime) ? 'cache' : 'mojang',
    _cacheTimestamp: (cacheTime) || undefined,
  }
}

router.use('/:uuid', (req, res, next) => {
  let { uuid } = req.params

  if (!uuidRegex.test(uuid)) {
    res.status(400)
    res.json({
      error: 'Invalid UUID'
    })
  } else {
    req.user = new User(uuid)
    next()
  }
})

router.get('/:uuid/', (req, res, next) => {
  req.user.getProfile()
    .then(d => {
      const [ data, cacheTime ] = d

      let textures = data.properties.find(e => e.name === 'textures').value
      textures = Buffer.from(textures, 'base64')
      textures = JSON.parse(textures).textures

      res.status(200)
      res.json({
        ...getCacheInfo(cacheTime),
        uuid: data.id,
        name: data.name,

        textures: {
          skin: (textures.SKIN) ? textures.SKIN.url : undefined,
          cape: (textures.CAPE) ? textures.CAPE.url : undefined
        }
      })
    })
    .catch(next)
})

router.get('/:uuid/names', (req, res, next) => {
  req.user.getNames() 
    .then(d => {
      const [ data, cacheTime ] = d

      res.status(200)
      res.json({
        ...getCacheInfo(cacheTime),
        current: data[data.length - 1].name,
        history: data.reverse()
      })
    })
    .catch(next)
})

router.use((err, req, res, next) => {
  if (err instanceof Error) {
    console.error(err)
    res.status(500)
    res.json({
      error: 'An unknown error has occurred'
    })
    return
  }

  res.status(err.status)
  res.json({
    error: err.msg
  })
})

module.exports = router