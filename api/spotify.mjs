import { getSpotifyStatus } from '../lib/spotify.mjs'

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Always give the browser fresh data when the page is refreshed.
  response.setHeader('Cache-Control', 'private, no-store')

  try {
    const status = await getSpotifyStatus()
    response.status(200).json(status)
  } catch (error) {
    console.error('[spotify] API error:', error)
    response.status(503).json({ error: 'Spotify data is unavailable' })
  }
}
