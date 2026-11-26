import type { IncomingMessage, ServerResponse } from 'node:http'

export function createVisitorsHandler(): (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<void>
