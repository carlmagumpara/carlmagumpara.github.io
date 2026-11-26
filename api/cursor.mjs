import http from 'node:http'
import { createCursorHub } from '../lib/cursor-hub.mjs'

// Vercel serves this default-exported Node server at /api/cursor and forwards
// WebSocket upgrade requests to it. Fluid compute keeps the function alive for
// the duration of each connection.
const server = http.createServer((_request, response) => {
  response.writeHead(404, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ error: 'Use a WebSocket connection at /api/cursor' }))
})

createCursorHub({ server })

export default server
