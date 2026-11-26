import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { cursorUrl } from '../lib/api'
import type { CursorUser } from '../lib/cursor-hub.mjs'

export type PresenceStatus = 'connecting' | 'online' | 'offline'

type PresenceContextValue = {
  /** Everyone else on the page, including visitors with a hidden cursor. */
  users: CursorUser[]
  /** Total people browsing, including the current visitor. 0 until connected. */
  count: number
  status: PresenceStatus
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

const ID_KEY = 'cursor:id'
const SEND_INTERVAL_MS = 33 // ~30 updates/sec
const COLORS = ['#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#fb7185', '#22d3ee', '#a3e635']
const NAMES = [
  'Fox', 'Otter', 'Panda', 'Heron', 'Lynx', 'Koala', 'Falcon', 'Badger',
  'Moth', 'Robin', 'Gecko', 'Whale', 'Wombat', 'Owl', 'Ibis', 'Quokka'
]

function hash(value: string): number {
  let result = 2166136261
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function clamp01(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

function identity() {
  let clientId = ''
  try {
    clientId = sessionStorage.getItem(ID_KEY) ?? ''
  } catch {
    // sessionStorage can be unavailable in private browsing.
  }
  if (!clientId) {
    clientId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
    try {
      sessionStorage.setItem(ID_KEY, clientId)
    } catch {
      // A temporary id is fine for this session.
    }
  }

  const seed = hash(clientId)
  return {
    clientId,
    name: `${NAMES[seed % NAMES.length]} ${(seed >>> 9) % 100}`,
    color: COLORS[(seed >>> 4) % COLORS.length]
  }
}

/**
 * Owns the one WebSocket connection shared by the cursor overlay and the
 * visitor counter, so each tab opens a single socket.
 */
export function LivePresenceProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<CursorUser[]>([])
  const [status, setStatus] = useState<PresenceStatus>('connecting')

  useEffect(() => {
    const me = identity()
    const url = cursorUrl()
    if (!url) return

    let cancelled = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let reconnectDelay = 1000
    let lastSentAt = 0
    let lastPosition = { x: 0.5, y: 0.5 }
    let hasMoved = false
    let visible = document.visibilityState === 'visible'

    function send(payload: object) {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
    }

    function scheduleReconnect() {
      if (cancelled || reconnectTimer) return
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000)
        connect()
      }, reconnectDelay)
    }

    function connect() {
      if (cancelled) return
      setStatus('connecting')

      try {
        socket = new WebSocket(url)
      } catch {
        setStatus('offline')
        scheduleReconnect()
        return
      }

      const current = socket

      current.addEventListener('open', () => {
        if (cancelled) return
        reconnectDelay = 1000
        setStatus('online')
        current.send(
          JSON.stringify({
            type: 'join',
            clientId: me.clientId,
            name: me.name,
            color: me.color,
            x: lastPosition.x,
            y: lastPosition.y,
            visible: hasMoved && visible
          })
        )
      })

      current.addEventListener('message', (event: MessageEvent<string>) => {
        let message: Record<string, unknown>
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }
        if (!message || typeof message !== 'object') return

        if (message.type === 'presence' && Array.isArray(message.users)) {
          setUsers(
            (message.users as CursorUser[]).filter((user) => user?.clientId && user.clientId !== me.clientId)
          )
          return
        }

        if (
          message.type === 'move' &&
          typeof message.clientId === 'string' &&
          message.clientId !== me.clientId
        ) {
          const clientId = message.clientId
          const x = clamp01(message.x)
          const y = clamp01(message.y)
          const nextVisible = message.visible === true
          setUsers((previous) => {
            const index = previous.findIndex((user) => user.clientId === clientId)
            if (index === -1) {
              return [
                ...previous,
                { clientId, name: 'Guest', color: '#818cf8', x, y, visible: nextVisible }
              ]
            }
            const updated = previous.slice()
            updated[index] = { ...updated[index], x, y, visible: nextVisible }
            return updated
          })
          return
        }

        if (message.type === 'leave' && typeof message.clientId === 'string') {
          setUsers((previous) => previous.filter((user) => user.clientId !== message.clientId))
        }
      })

      current.addEventListener('close', () => {
        if (cancelled) return
        setUsers([])
        setStatus('offline')
        scheduleReconnect()
      })

      current.addEventListener('error', () => {
        // `close` always follows and owns the reconnect.
      })
    }

    function onMouseMove(event: MouseEvent) {
      hasMoved = true
      lastPosition = {
        x: clamp01(event.clientX / window.innerWidth),
        y: clamp01(event.clientY / window.innerHeight)
      }

      const now = Date.now()
      if (now - lastSentAt < SEND_INTERVAL_MS) return
      lastSentAt = now
      send({ type: 'move', ...lastPosition, visible })
    }

    function setPresence(nextVisible: boolean) {
      visible = nextVisible
      if (hasMoved) send({ type: 'visible', visible })
    }

    const onMouseLeave = () => setPresence(false)
    const onMouseEnter = () => setPresence(true)
    const onVisibilityChange = () => setPresence(document.visibilityState === 'visible')

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('visibilitychange', onVisibilityChange)

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onclose = null
        socket.onerror = null
        socket.close()
      }
    }
  }, [])

  const value = useMemo<PresenceContextValue>(
    () => ({ users, count: status === 'online' ? users.length + 1 : 0, status }),
    [users, status]
  )

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence(): PresenceContextValue {
  const value = useContext(PresenceContext)
  if (!value) throw new Error('usePresence must be used inside LivePresenceProvider')
  return value
}
