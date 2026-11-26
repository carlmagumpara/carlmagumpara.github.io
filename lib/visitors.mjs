import { createHmac } from 'node:crypto'

const ALL_KEY = 'visitors:all'
const DAY_TTL_SECONDS = 48 * 60 * 60
const MAX_BODY = 1024
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function isValidVisitorId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id)
}

// Never persist the raw client id; a secret-scoped hash is enough to dedupe.
function hashId(id) {
  const secret = process.env.VISITOR_HASH_SECRET || process.env.UPSTASH_REDIS_REST_TOKEN || ''
  return createHmac('sha256', secret).update(id).digest('hex')
}

function dayKey() {
  return `visitors:day:${new Date().toISOString().slice(0, 10)}`
}

// `vite dev` fallback when no Upstash credentials are configured. Module state
// is fine for local development but must never be used on Vercel.
const devAll = new Set()
const devDays = new Map()

function recordLocally(hash, key) {
  devAll.add(hash)
  let day = devDays.get(key)
  if (!day) {
    day = new Set()
    devDays.set(key, day)
  }
  day.add(hash)
  return { total: devAll.size, today: day.size }
}

async function recordRemotely(hash, key, url, token) {
  const commands = [
    ['SADD', ALL_KEY, hash],
    ['SCARD', ALL_KEY],
    ['SADD', key, hash],
    ['EXPIRE', key, String(DAY_TTL_SECONDS)],
    ['SCARD', key]
  ]

  const response = await fetch(`${url.replace(/\/+$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  })
  if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}`)

  const results = await response.json()
  if (!Array.isArray(results)) throw new Error('Unexpected Upstash response')
  const values = results.map((entry) => {
    if (entry && typeof entry === 'object' && 'error' in entry) {
      throw new Error(String(entry.error))
    }
    return entry?.result
  })

  return { total: Number(values[1]) || 0, today: Number(values[4]) || 0 }
}

async function recordVisit(id) {
  if (!isValidVisitorId(id)) throw new HttpError(400, 'Invalid visitor id')

  const hash = hashId(id)
  const key = dayKey()
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // A deployed counter must never silently report fake numbers.
    if (process.env.VERCEL) throw new Error('Upstash credentials are not configured')
    return recordLocally(hash, key)
  }

  return recordRemotely(hash, key, url, token)
}

function sendJson(response, status, body) {
  response.statusCode = status
  for (const [name, value] of Object.entries(CORS_HEADERS)) response.setHeader(name, value)
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    let tooLarge = false
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      if (tooLarge) return
      body += chunk
      if (body.length > MAX_BODY) {
        tooLarge = true
        body = ''
        reject(new HttpError(413, 'Payload too large'))
      }
    })
    request.on('end', () => {
      if (!tooLarge) resolve(body.trim())
    })
    request.on('error', reject)
  })
}

function extractId(body) {
  const trimmed = body.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)?.id ?? ''
    } catch {
      return ''
    }
  }
  return trimmed
}

/**
 * Shared HTTP handler for the unique-visitor counter. Used by the Vercel
 * function (api/visitors.mjs) and mirrored by the Vite dev server so local and
 * deployed behaviour stay identical.
 */
export function createVisitorsHandler() {
  return async function handler(request, response) {
    if (request.method === 'OPTIONS') {
      for (const [name, value] of Object.entries(CORS_HEADERS)) response.setHeader(name, value)
      response.statusCode = 204
      response.end()
      return
    }

    try {
      let id = ''
      if (request.method === 'GET') {
        let url
        try {
          url = new URL(request.url ?? '/', 'http://localhost')
        } catch {
          url = new URL('http://localhost')
        }
        id = url.searchParams.get('id') ?? ''
      } else if (request.method === 'POST') {
        id = extractId(await readBody(request))
      } else {
        sendJson(response, 405, { error: 'Method not allowed' })
        return
      }

      if (!isValidVisitorId(id)) {
        sendJson(response, 400, { error: 'Invalid visitor id' })
        return
      }

      sendJson(response, 200, await recordVisit(id))
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 503
      if (status === 503) console.error('[visitors] API error:', error)
      sendJson(response, status, {
        error: status === 503 ? 'Counter unavailable' : error instanceof Error ? error.message : 'Bad request'
      })
    }
  }
}
