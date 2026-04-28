const http = require('http')
const route = require('./router')
const PORT = 8888

const server = http.createServer((req, res) => {
  try {
    route(req, res)
  } catch (err) {
    console.error('error: ', err)

    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
    }
    res.end('internal server error')
  }
})

server.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`)
})
