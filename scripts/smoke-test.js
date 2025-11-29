const http = require('http')

const url = process.env.SMOKE_URL || 'http://localhost:3000'
const timeout = 10000

function check() {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        if (data.includes('Hello Cora')) return resolve(true)
        return reject(new Error('Hello Cora not found in response'))
      })
    })
    req.on('error', reject)
    req.setTimeout(timeout, () => {
      req.destroy(new Error('Request timed out'))
    })
  })
}

(async () => {
  try {
    await check()
    console.log('Smoke test passed: Hello Cora found')
    process.exit(0)
  } catch (err) {
    console.error('Smoke test failed:', err.message)
    process.exit(1)
  }
})()
