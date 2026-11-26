import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(root, 'data', 'last-played.json')
const envFile = path.join(root, '.env.local')

try {
  process.loadEnvFile('.env.local')
} catch {
  // No .env.local - environment variables may still be provided by the host.
}
try {
  process.loadEnvFile('.env')
} catch {
  // Optional.
}

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

if (!clientId || !clientSecret || !refreshToken) {
  console.warn('[spotify] Credentials not found. Keeping the existing data/last-played.json fallback.')
  process.exit(0)
}

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
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

  // Spotify may rotate the refresh token; persist the new one so future builds keep working.
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    try {
      const current = await readFile(envFile, 'utf8')
      const updated = current.replace(
        /^SPOTIFY_REFRESH_TOKEN=.*$/m,
        `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`
      )
      await writeFile(envFile, updated)
      console.log('[spotify] Updated rotated refresh token in .env.local')
    } catch {
      console.warn('[spotify] Refresh token rotated. Update SPOTIFY_REFRESH_TOKEN in your environment.')
    }
  }

  return data.access_token
}

async function getLastPlayed(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!response.ok) {
    throw new Error(`Recently-played request failed (${response.status}): ${await response.text()}`)
  }

  const item = (await response.json()).items?.[0]
  if (!item?.track) return null

  const track = item.track
  const images = track.album?.images ?? []
  const largest = images.reduce((best, image) => (!best || image.width > best.width ? image : best), null)

  return {
    track: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album?.name ?? '',
    image: largest?.url ?? '',
    url: track.external_urls?.spotify ?? 'https://open.spotify.com/',
    playedAt: item.played_at ?? null
  }
}

try {
  const accessToken = await getAccessToken()
  const lastPlayed = await getLastPlayed(accessToken)

  if (!lastPlayed) {
    console.warn('[spotify] No recently played track found. Keeping the existing fallback.')
    process.exit(0)
  }

  await writeFile(outputFile, `${JSON.stringify(lastPlayed, null, 2)}\n`)
  console.log(`[spotify] Last played: ${lastPlayed.track} - ${lastPlayed.artist}`)
} catch (error) {
  console.warn(`[spotify] Could not update last played track: ${error.message}`)
  console.warn('[spotify] Keeping the existing data/last-played.json fallback.')
}
