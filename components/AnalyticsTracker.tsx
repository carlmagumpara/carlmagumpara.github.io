import { useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { isFacebookVisit, normalizeAnalyticsPath, type AnalyticsEvent } from '../lib/analytics-client'
import { apiUrl } from '../lib/api'

const FLUSH_INTERVAL_MS = 4_000
const MAX_QUEUE = 50
const CLICK_THROTTLE_MS = 120

// One queue for the whole app: the layout survives client-side navigation, and
// module state also protects against React's double-invoked dev effects.
let queue: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | undefined
let lastClickAt = 0
const seenPaths = new Set<string>()

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

function enqueue(event: AnalyticsEvent) {
  queue.push(event)
  if (queue.length >= MAX_QUEUE) {
    void flush()
    return
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = undefined
      void flush()
    }, FLUSH_INTERVAL_MS)
  }
}

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = undefined
  }
  if (!queue.length) return

  const events = queue
  queue = []
  try {
    const response = await fetch(apiUrl('/api/analytics'), {
      method: 'POST',
      // text/plain keeps this a CORS "simple request" from GitHub Pages.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ events }),
      keepalive: true
    })
    // A configured API rejecting the batch is permanent — don't retry forever.
    if (!response.ok) return
  } catch {
    // A network failure is transient: keep the newest events for a later retry.
    queue = [...events, ...queue].slice(-MAX_QUEUE)
  }
}

function cleanLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 64) || 'Other'
}

/** A short, human-readable name for the clicked element. */
function describeTarget(target: EventTarget | null): string {
  if (!(target instanceof Element)) return 'Other'

  const explicit = target.closest<HTMLElement>('[data-analytics-label]')?.dataset.analyticsLabel
  if (explicit) return cleanLabel(explicit)

  const interactive = target.closest<HTMLElement>('a, button, input, select, textarea, summary, [role="button"]')
  if (interactive) {
    const label =
      interactive.getAttribute('aria-label') ||
      interactive.getAttribute('title') ||
      interactive.textContent ||
      ''
    const text = cleanLabel(label)
    if (text) return text
    if (interactive instanceof HTMLAnchorElement) {
      return cleanLabel(`Link: ${interactive.getAttribute('href') || 'external'}`)
    }
    return cleanLabel(interactive.tagName)
  }

  return cleanLabel(target.tagName)
}

function onClick(event: MouseEvent) {
  if (event.button !== 0) return
  const path = normalizeAnalyticsPath(window.location.pathname)
  // The dashboard must not measure its own filters as site engagement.
  if (!path || path === '/analytics') return
  if (event.target instanceof Element && event.target.closest('[data-analytics-ignore]')) return

  const now = Date.now()
  if (now - lastClickAt < CLICK_THROTTLE_MS) return
  lastClickAt = now

  enqueue({
    type: 'click',
    path,
    x: clamp01(event.clientX / window.innerWidth),
    y: clamp01(event.clientY / window.innerHeight),
    target: describeTarget(event.target)
  })
}

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') void flush()
}

/** Invisible: records one view per route and batches clicks to /api/analytics. */
export function AnalyticsTracker() {
  const { urlPathname } = usePageContext()
  const path = normalizeAnalyticsPath(urlPathname ?? '')

  useEffect(() => {
    if (!path || seenPaths.has(path)) return
    seenPaths.add(path)
    enqueue({ type: 'view', path, source: isFacebookVisit() ? 'facebook' : undefined })
  }, [path])

  useEffect(() => {
    document.addEventListener('click', onClick, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  return null
}
