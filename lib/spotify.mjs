const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const PLAYER_URL = 'https://api.spotify.com/v1/me/player'

let cachedToken = null
let tokenRotationHandler = null

export function onSpotifyTokenRotated(handler) {
  tokenRotationHandler = handler
}

export function hasSpotifyCredentials() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN
  )
}

export function loadSpotifyEnv() {
  if (hasSpotifyCredentials()) return
  try {
    process.loadEnvFile('.env.local')
  } catch {
    // No .env.local - credentials may be provided by the host.
  }
  try {
    process.loadEnvFile('.env')
  } catch {
    // Optional.
  }
}

async function getAccessToken() {
  loadSpotifyEnv()

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Spotify credentials are not configured')
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed (${response.status}): ${await response.text()}`)
  }

  const data = await response.json()
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
  }

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    if (tokenRotationHandler) {
      await tokenRotationHandler(data.refresh_token)
    } else {
      console.warn('[spotify] Refresh token rotated. Update SPOTIFY_REFRESH_TOKEN in your environment.')
    }
  }

  return cachedToken.accessToken
}

function normalizeTrack(track, playedAt, playing) {
  const images = track.album?.images ?? []
  const largest = images.reduce((best, image) => (!best || image.width > best.width ? image : best), null)

  return {
    playing,
    track: track.name,
    artist: (track.artists ?? []).map((artist) => artist.name).join(', '),
    album: track.album?.name ?? '',
    image: largest?.url ?? '',
    url: track.external_urls?.spotify ?? 'https://open.spotify.com/',
    playedAt: typeof playedAt === 'number' ? new Date(playedAt).toISOString() : playedAt ?? null
  }
}

export async function getSpotifyStatus() {
  const accessToken = await getAccessToken()
  const headers = { Authorization: `Bearer ${accessToken}` }

  // Prefer the track playing right now; fall back to the most recent one.
  try {
    const response = await fetch(`${PLAYER_URL}/currently-playing`, { headers })
    if (response.ok) {
      const data = await response.json()
      if (data?.item?.name) {
        return normalizeTrack(data.item, data.timestamp, Boolean(data.is_playing))
      }
    }
  } catch (error) {
    console.warn(`[spotify] Could not read currently playing track: ${error.message}`)
  }

  const response = await fetch(`${PLAYER_URL}/recently-played?limit=1`, { headers })
  if (!response.ok) {
    throw new Error(`Recently-played request failed (${response.status}): ${await response.text()}`)
  }

  const item = (await response.json()).items?.[0]
  if (!item?.track) return null

  return normalizeTrack(item.track, item.played_at, false)
}
