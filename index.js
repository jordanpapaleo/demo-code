const express = require('express')
const http = require('http')
const app = express()

app.get('/', (req, res) => {
  
})

const server = http.createServer(app)
const PORT = process.env.PORT || 5000

server.listen(PORT, (err) => {
  if (err) { throw err }
  console.log(`Server running on port:${PORT}`)
})
