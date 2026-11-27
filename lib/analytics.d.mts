import type { IncomingMessage, ServerResponse } from 'node:http'

export function createAnalyticsHandler(): (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<void>
