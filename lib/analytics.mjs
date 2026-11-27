// Analytics storage and aggregation. Shared by the Vercel function
// (api/analytics.mjs) and the `vite dev` mirror in vite.config.ts.
//
// Redis keys (all timestamps are UTC):
//   analytics:views:daily          hash  date -> views
//   analytics:clicks:daily         hash  date -> clicks
//   analytics:views:paths          hash  path -> views
//   analytics:clicks:paths         hash  path -> clicks
//   analytics:clicks:cells:DATE    hash  "col:row" -> clicks (14-day TTL)
//   analytics:clicks:targets:DATE  hash  label -> clicks (14-day TTL)

const VIEW_PATHS = new Set(['/', '/projects', '/work-experience', '/get-in-touch', '/analytics'])
const MAX_BODY = 32_000
const MAX_EVENTS = 50
const MAX_TARGET_LENGTH = 64
const GRID_COLS = 20
const GRID_ROWS = 12
const HISTORY_DAYS = 30
const DETAIL_DAYS = 14
const CACHE_TTL_MS = 30_000

const DAILY_TTL_SECONDS = 400 * 24 * 60 * 60
const DETAIL_TTL_SECONDS = 30 * 24 * 60 * 60

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function normalizePath(value) {
  if (typeof value !== 'string') return ''
  const path = value.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
  return VIEW_PATHS.has(path) ? path : ''
}

function dateKey(offsetDays = 0) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - offsetDays)
  return date.toISOString().slice(0, 10)
}

/** Oldest first, ending with today. */
function lastDates(days) {
  return Array.from({ length: days }, (_, index) => dateKey(days - 1 - index))
}

function cellKey(x, y) {
  const col = Math.min(GRID_COLS - 1, Math.floor(clamp01(x) * GRID_COLS))
  const row = Math.min(GRID_ROWS - 1, Math.floor(clamp01(y) * GRID_ROWS))
  return `${col}:${row}`
}

function cleanTarget(value) {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim() : ''
  return text.slice(0, MAX_TARGET_LENGTH) || 'Other'
}

function parseEvents(body) {
  if (body.length > MAX_BODY) throw new HttpError(413, 'Payload too large')

  let payload
  try {
    payload = JSON.parse(body)
  } catch {
    throw new HttpError(400, 'Invalid JSON')
  }
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.events)) {
    throw new HttpError(400, 'Expected an events array')
  }

  const events = []
  for (const raw of payload.events.slice(0, MAX_EVENTS)) {
    if (!raw || typeof raw !== 'object') continue
    const path = normalizePath(raw.path)
    if (!path) continue

    if (raw.type === 'view') {
      events.push({ type: 'view', path })
    } else if (raw.type === 'click') {
      const x = Number(raw.x)
      const y = Number(raw.y)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      events.push({ type: 'click', path, x: clamp01(x), y: clamp01(y), target: cleanTarget(raw.target) })
    }
  }
  return events
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

function mapFromRedisResult(result) {
  const map = new Map()
  if (Array.isArray(result)) {
    for (let index = 0; index + 1 < result.length; index += 2) {
      increment(map, String(result[index]), Number(result[index + 1]) || 0)
    }
  } else if (result && typeof result === 'object') {
    for (const [key, value] of Object.entries(result)) increment(map, key, Number(value) || 0)
  }
  return map
}

function mergeMaps(maps) {
  const merged = new Map()
  for (const map of maps) {
    for (const [key, value] of map) increment(merged, key, value)
  }
  return merged
}

/** Dev-only fallback: the same aggregates, held in module memory. */
function createMemoryStore() {
  const viewsByDate = new Map()
  const clicksByDate = new Map()
  const viewsByPath = new Map()
  const clicksByPath = new Map()
  const cellsByDate = new Map()
  const targetsByDate = new Map()

  function bucket(container, date) {
    let value = container.get(date)
    if (!value) {
      value = new Map()
      container.set(date, value)
    }
    return value
  }

  function record(events) {
    const date = dateKey()
    const cells = bucket(cellsByDate, date)
    const targets = bucket(targetsByDate, date)
    let recorded = 0

    for (const event of events) {
      if (event.type === 'view') {
        increment(viewsByDate, date)
        increment(viewsByPath, event.path)
      } else {
        increment(clicksByDate, date)
        increment(clicksByPath, event.path)
        increment(cells, cellKey(event.x, event.y))
        increment(targets, event.target)
      }
      recorded++
    }
    return recorded
  }

  function snapshot() {
    const dates = lastDates(DETAIL_DAYS)
    return {
      viewsByDate,
      clicksByDate,
      viewsByPath,
      clicksByPath,
      cells: mergeMaps(dates.map((date) => cellsByDate.get(date) ?? new Map())),
      targets: mergeMaps(dates.map((date) => targetsByDate.get(date) ?? new Map()))
    }
  }

  return { record, snapshot }
}

function createUpstashStore(url, token) {
  async function pipeline(commands) {
    const response = await fetch(`${url.replace(/\/+$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands)
    })
    if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}`)

    const results = await response.json()
    if (!Array.isArray(results)) throw new Error('Unexpected Upstash response')
    return results.map((entry) => {
      if (entry && typeof entry === 'object' && 'error' in entry) throw new Error(String(entry.error))
      return entry?.result
    })
  }

  async function record(events) {
    const date = dateKey()
    const commands = []
    const expires = new Map()
    const expireOnce = (key, ttl) => expires.set(key, ttl)

    for (const event of events.filter((event) => event.type === 'view')) {
      commands.push(['HINCRBY', 'analytics:views:paths', event.path, '1'])
      commands.push(['HINCRBY', 'analytics:views:daily', date, '1'])
      expireOnce('analytics:views:paths', DAILY_TTL_SECONDS)
      expireOnce('analytics:views:daily', DAILY_TTL_SECONDS)
    }
    for (const event of events.filter((event) => event.type === 'click')) {
      commands.push(['HINCRBY', 'analytics:clicks:daily', date, '1'])
      commands.push(['HINCRBY', 'analytics:clicks:paths', event.path, '1'])
      commands.push(['HINCRBY', `analytics:clicks:cells:${date}`, cellKey(event.x, event.y), '1'])
      commands.push(['HINCRBY', `analytics:clicks:targets:${date}`, event.target, '1'])
      expireOnce('analytics:clicks:daily', DAILY_TTL_SECONDS)
      expireOnce('analytics:clicks:paths', DAILY_TTL_SECONDS)
      expireOnce(`analytics:clicks:cells:${date}`, DETAIL_TTL_SECONDS)
      expireOnce(`analytics:clicks:targets:${date}`, DETAIL_TTL_SECONDS)
    }
    for (const [key, ttl] of expires) commands.push(['EXPIRE', key, String(ttl)])
    if (commands.length) await pipeline(commands)

    return acceptedViews.length + clicks.length
  }

  async function snapshot() {
    const detailDates = lastDates(DETAIL_DAYS)
    const commands = [
      ['HGETALL', 'analytics:views:daily'],
      ['HGETALL', 'analytics:clicks:daily'],
      ['HGETALL', 'analytics:views:paths'],
      ['HGETALL', 'analytics:clicks:paths'],
      ...detailDates.flatMap((date) => [
        ['HGETALL', `analytics:clicks:cells:${date}`],
        ['HGETALL', `analytics:clicks:targets:${date}`]
      ])
    ]
    const results = await pipeline(commands)
    const detail = results.slice(4)
    return {
      viewsByDate: mapFromRedisResult(results[0]),
      clicksByDate: mapFromRedisResult(results[1]),
      viewsByPath: mapFromRedisResult(results[2]),
      clicksByPath: mapFromRedisResult(results[3]),
      cells: mergeMaps(detail.filter((_, index) => index % 2 === 0).map(mapFromRedisResult)),
      targets: mergeMaps(detail.filter((_, index) => index % 2 === 1).map(mapFromRedisResult))
    }
  }

  return { record, snapshot }
}

function summarize(raw) {
  const daily = lastDates(HISTORY_DAYS).map((date) => ({
    date,
    views: raw.viewsByDate.get(date) ?? 0,
    clicks: raw.clicksByDate.get(date) ?? 0
  }))
  const totals = {
    // Path counters keep ~400 days, so these are the all-time totals within
    // retention; `daily` below only drives the chart window.
    views: [...raw.viewsByPath.values()].reduce((sum, count) => sum + count, 0),
    clicks: [...raw.clicksByPath.values()].reduce((sum, count) => sum + count, 0),
    viewsToday: daily.at(-1)?.views ?? 0,
    clicksToday: daily.at(-1)?.clicks ?? 0,
    activeDays: daily.filter((day) => day.views > 0 || day.clicks > 0).length
  }

  const pages = [...new Set([...raw.viewsByPath.keys(), ...raw.clicksByPath.keys()])]
    .map((path) => ({ path, views: raw.viewsByPath.get(path) ?? 0, clicks: raw.clicksByPath.get(path) ?? 0 }))
    .sort((a, b) => b.views - a.views || b.clicks - a.clicks)

  const targets = [...raw.targets.entries()]
    .map(([label, clicks]) => ({ label, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  const cells = [...raw.cells.entries()]
    .map(([key, clicks]) => {
      const [col, row] = key.split(':').map(Number)
      return {
        x: (col + 0.5) / GRID_COLS,
        y: (row + 0.5) / GRID_ROWS,
        clicks
      }
    })
    .filter((cell) => cell.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)

  return {
    generatedAt: new Date().toISOString(),
    historyDays: HISTORY_DAYS,
    grid: { cols: GRID_COLS, rows: GRID_ROWS },
    detailDays: DETAIL_DAYS,
    totals,
    daily,
    pages,
    targets,
    heatmap: {
      days: DETAIL_DAYS,
      cols: GRID_COLS,
      rows: GRID_ROWS,
      total: cells.reduce((sum, cell) => sum + cell.clicks, 0),
      cells,
      peak: cells[0] ?? null
    }
  }
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
        reject(new HttpError(413, 'Payload too large'))
      }
    })
    request.on('end', () => {
      if (!tooLarge) resolve(body.trim())
    })
    request.on('error', reject)
  })
}

const memoryStore = createMemoryStore()
let cached = { at: 0, data: null }

/**
 * Shared HTTP handler for view/click analytics: POST stores a batch of events,
 * GET returns the aggregates rendered by /analytics.
 */
export function createAnalyticsHandler() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  const store = url && token ? createUpstashStore(url, token) : null

  return async function handler(request, response) {
    if (request.method === 'OPTIONS') {
      for (const [name, value] of Object.entries(CORS_HEADERS)) response.setHeader(name, value)
      response.statusCode = 204
      response.end()
      return
    }

    try {
      // A deployed counter must never silently report fake numbers.
      if (!store && process.env.VERCEL) {
        sendJson(response, 503, { error: 'Analytics storage is not configured' })
        return
      }
      const activeStore = store ?? memoryStore

      if (request.method === 'GET') {
        const now = Date.now()
        if (!cached.data || now - cached.at > CACHE_TTL_MS) {
          cached = { at: now, data: summarize(await activeStore.snapshot()) }
        }
        sendJson(response, 200, cached.data)
        return
      }

      if (request.method === 'POST') {
        const events = parseEvents(await readBody(request))
        if (events.length) {
          await activeStore.record(events)
          cached = { at: 0, data: null }
        }
        sendJson(response, 200, { recorded: events.length })
        return
      }

      sendJson(response, 405, { error: 'Method not allowed' })
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 503
      if (status === 503) console.error('[analytics] API error:', error)
      sendJson(response, status, {
        error: status === 503 ? 'Analytics unavailable' : error instanceof Error ? error.message : 'Bad request'
      })
    }
  }
}
