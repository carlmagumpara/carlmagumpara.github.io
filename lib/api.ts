/**
 * The Vercel app serves live /api/* serverless functions. Set
 * VITE_VERCEL_API_ORIGIN at build time to point cross-origin fetches at it (the
 * deploy workflow does this for the GitHub Pages site). When unset, calls stay
 * same-origin, which works for `vite dev` and the Vercel deployment.
 */
export function apiUrl(path: '/api/github' | '/api/spotify'): string {
  const origin = import.meta.env.VITE_VERCEL_API_ORIGIN
  if (typeof window !== 'undefined' && origin) {
    return `${origin.replace(/\/$/, '')}${path}`
  }
  return path
}

/**
 * WebSocket endpoint for live cursors. Set VITE_CURSOR_WS_URL at build time to
 * the socket host (e.g. wss://example.com/api/cursor); the deploy workflow does
 * this for the GitHub Pages site. When unset, connect to the current origin,
 * which is where `vite dev` and the Vercel deployment serve the cursor hub.
 */
export function cursorUrl(): string {
  if (typeof window === 'undefined') return ''

  const configured = import.meta.env.VITE_CURSOR_WS_URL
  if (configured) return configured

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/api/cursor`
}
