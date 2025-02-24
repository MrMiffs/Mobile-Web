#!/usr/bin/env node

const http = require('http')

const dancers = []

const handleRequest = (req, res) => {
  const [path, query] = req.url.split('?')

  if (path === '/api') {
    if (req.method === 'POST') {
      let body = ''
      req.on('data', (data) => {
        body += data
      })
      req.on('end', () => {
        try {
          const params = Object.fromEntries(body.split('&').map(
            (param) => param.split('=')
          ))
          dancers.push(params)
          kbye(res)
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Invalid request body" }))
        }
      })
    } else if (req.method === 'GET') {
      kbye(res)
    } else {
      res.writeHead(405, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Method not allowed" }))
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Endpoint not found" }))
  }
}

const kbye = (res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  })
  res.write(JSON.stringify(dancers))
  res.end()
}

const server = http.createServer(handleRequest)
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
