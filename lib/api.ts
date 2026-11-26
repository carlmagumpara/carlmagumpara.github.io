const VERCEL_API_ORIGIN = 'https://portfolio-v2-iota-jade.vercel.app'
const VERCEL_WS_ORIGIN = VERCEL_API_ORIGIN.replace('https://', 'wss://')

/**
 * The Vercel app serves live /api/* serverless functions. GitHub Pages is
 * static-only, so calls made from a github.io host are sent to that deployment.
 */
export function apiUrl(path: '/api/github' | '/api/spotify'): string {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    return `${VERCEL_API_ORIGIN}${path}`
  }
  return path
}

/**
 * WebSocket endpoint for live cursors. Locally it lives on the Vite dev server;
 * from github.io it points at the Vercel function. VITE_CURSOR_WS_URL can
 * override this for a custom socket host.
 */
export function cursorUrl(): string {
  if (typeof window === 'undefined') return ''

  const override = import.meta.env.VITE_CURSOR_WS_URL
  if (override) return override

  if (window.location.hostname.endsWith('.github.io')) {
    return `${VERCEL_WS_ORIGIN}/api/cursor`
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/api/cursor`
}
