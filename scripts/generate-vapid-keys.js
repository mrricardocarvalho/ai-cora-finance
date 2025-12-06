const webpush = require('web-push')
const keys = webpush.generateVAPIDKeys()
console.log('VAPID public key:', keys.publicKey)
console.log('VAPID private key:', keys.privateKey)
