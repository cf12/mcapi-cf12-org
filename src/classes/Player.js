const fetch = require('node-fetch')

class Player {
  constructor (uuid) {
    this.uuid = uuid.replace(/-/g, '')
  }

  cachedFetch (url, key, duration) {
    const dbKey = `players:${this.uuid}:${key}`

    return new Promise(async (resolve, reject) => {
      try {
        const cachedData = JSON.parse(await rClient.getAsync(dbKey))

        if (cachedData) {
          if (cachedData.valid) {
            return resolve([ cachedData.data, cachedData.cacheTime ])
          } else {
            return reject({
              status: 404,
              msg: 'Player not found'
            })
          }
        }

        const res = await fetch(url)
  
        if (res.status === 204) {
          await rClient.setexAsync(dbKey, duration, JSON.stringify({
            valid: false
          }))

          return reject({
            status: 404,
            msg: 'Player not found'
          })
        } else if (res.status === 429)
          // Fallback error in case cache doesn't work
          return reject({
            status: 429,
            msg: 'Mojang has rate limited this request, please try again later'
          })
  
        const data = await res.json()
        rClient.setexAsync(dbKey, duration, JSON.stringify({ 
          valid: true, 
          cacheTime: Date.now(), 
          data: data
        }))
        resolve([ data, null ])
      } catch (err) {
        reject(err)
      }
    })
  }

  getNames () {
    return this.cachedFetch(
      `https://api.mojang.com/user/profiles/${this.uuid}/names`,
      'names',
      30
    )
  }

  getProfile () {
    return this.cachedFetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${this.uuid}`,
      'profile',
      60
    )
  }
}

module.exports = Player