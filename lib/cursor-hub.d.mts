import type { IncomingMessage, Server } from 'node:http'
import type { Duplex } from 'node:stream'
import type { WebSocketServer } from 'ws'

export type CursorUser = {
  clientId: string
  name: string
  color: string
  x: number
  y: number
  visible: boolean
}

export function createCursorHub(options?: {
  server?: Server
  path?: string
}): {
  wss: WebSocketServer
  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): boolean
  close(): void
}
