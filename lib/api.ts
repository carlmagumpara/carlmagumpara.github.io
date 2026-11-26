const VERCEL_API_ORIGIN = 'https://portfolio-v2-iota-jade.vercel.app'

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
