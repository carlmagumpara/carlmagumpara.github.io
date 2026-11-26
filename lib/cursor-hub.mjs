import { WebSocket, WebSocketServer } from 'ws'

const CURSOR_PATH = '/api/cursor'
const MAX_PAYLOAD = 512
const MIN_MOVE_INTERVAL_MS = 32
const DEFAULT_COLOR = '#818cf8'
const HEX_COLOR = /^#[0-9a-f]{6}$/i

function clamp01(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

function cleanString(value, maxLength) {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

/**
 * Shared WebSocket hub. Used by both the Vercel function (api/cursor.mjs) and
 * the Vite dev server plugin so local and deployed behaviour stay identical.
 *
 * Coordinates are normalised to 0..1 against the viewport, so cursors line up
 * across screen sizes. State is per-instance only; see _docs for the pub/sub
 * note on scaling across multiple Vercel instances.
 */
export function createCursorHub({ server, path = CURSOR_PATH } = {}) {
  const wss = new WebSocketServer({
    ...(server ? { server } : { noServer: true }),
    maxPayload: MAX_PAYLOAD
  })

  // ws -> { clientId, name, color, x, y, visible, lastMoveAt }
  const clients = new Map()

  function broadcast(payload, except) {
    const data = JSON.stringify(payload)
    for (const target of wss.clients) {
      if (target === except || target.readyState !== WebSocket.OPEN) continue
      try {
        target.send(data)
      } catch {
        // A socket can die between the readyState check and send().
      }
    }
  }

  function presence() {
    // One entry per clientId: a reconnect briefly leaves two sockets open.
    const users = new Map()
    for (const state of clients.values()) {
      if (!state.clientId) continue
      users.set(state.clientId, {
        clientId: state.clientId,
        name: state.name,
        color: state.color,
        x: state.x,
        y: state.y,
        visible: state.visible
      })
    }
    return [...users.values()]
  }

  function broadcastPresence() {
    broadcast({ type: 'presence', users: presence() })
  }

  wss.on('connection', (ws) => {
    const state = {
      clientId: '',
      name: 'Guest',
      color: DEFAULT_COLOR,
      x: 0.5,
      y: 0.5,
      visible: false,
      lastMoveAt: 0
    }
    clients.set(ws, state)

    // Send the current roster immediately; the new client filters itself out.
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'presence', users: presence() }))
    }

    ws.on('message', (raw) => {
      let event
      try {
        event = JSON.parse(raw.toString())
      } catch {
        return // ignore non-JSON frames
      }
      if (!event || typeof event !== 'object') return

      if (event.type === 'join') {
        const clientId = cleanString(event.clientId, 64)
        if (!clientId || state.clientId) return
        state.clientId = clientId
        state.name = cleanString(event.name, 24) || 'Guest'
        state.color = HEX_COLOR.test(event.color) ? event.color : DEFAULT_COLOR
        state.x = clamp01(event.x)
        state.y = clamp01(event.y)
        state.visible = event.visible === true
        broadcastPresence()
        return
      }

      if (!state.clientId) return // ignore events from sockets that haven't joined

      if (event.type === 'move') {
        const now = Date.now()
        if (now - state.lastMoveAt < MIN_MOVE_INTERVAL_MS) return
        state.lastMoveAt = now
        state.x = clamp01(event.x)
        state.y = clamp01(event.y)
        if (typeof event.visible === 'boolean') state.visible = event.visible
        broadcast(
          { type: 'move', clientId: state.clientId, x: state.x, y: state.y, visible: state.visible },
          ws
        )
        return
      }

      if (event.type === 'visible') {
        state.visible = event.visible === true
        broadcast(
          { type: 'move', clientId: state.clientId, x: state.x, y: state.y, visible: state.visible },
          ws
        )
      }
    })

    const onClose = () => {
      if (!clients.delete(ws)) return
      if (state.clientId) broadcast({ type: 'leave', clientId: state.clientId }, ws)
      broadcastPresence()
    }
    ws.on('close', onClose)
    ws.on('error', onClose)
  })

  function handleUpgrade(request, socket, head) {
    let pathname
    try {
      pathname = new URL(request.url, 'http://localhost').pathname
    } catch {
      return false
    }
    if (pathname !== path) return false
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request))
    return true
  }

  function close() {
    for (const client of wss.clients) client.terminate()
    wss.close()
  }

  return { wss, handleUpgrade, close }
}
