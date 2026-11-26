import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getSpotifyStatus,
  hasSpotifyCredentials,
  loadSpotifyEnv,
  onSpotifyTokenRotated
} from '../lib/spotify.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(root, 'data', 'last-played.json')
const envFile = path.join(root, '.env.local')

loadSpotifyEnv()

if (!hasSpotifyCredentials()) {
  console.warn('[spotify] Credentials not found. Keeping the existing data/last-played.json fallback.')
  process.exit(0)
}

// Spotify may rotate the refresh token; persist the new one so future builds keep working.
onSpotifyTokenRotated(async (token) => {
  try {
    const current = await readFile(envFile, 'utf8')
    await writeFile(envFile, current.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, `SPOTIFY_REFRESH_TOKEN=${token}`))
    console.log('[spotify] Updated rotated refresh token in .env.local')
  } catch {
    console.warn('[spotify] Refresh token rotated. Update SPOTIFY_REFRESH_TOKEN in your environment.')
  }
})

try {
  const status = await getSpotifyStatus()

  if (!status) {
    console.warn('[spotify] No recently played track found. Keeping the existing fallback.')
    process.exit(0)
  }

  const { playing, ...lastPlayed } = status
  await writeFile(outputFile, `${JSON.stringify(lastPlayed, null, 2)}\n`)
  console.log(`[spotify] ${playing ? 'Now playing' : 'Last played'}: ${lastPlayed.track} - ${lastPlayed.artist}`)
} catch (error) {
  console.warn(`[spotify] Could not update last played track: ${error.message}`)
  console.warn('[spotify] Keeping the existing data/last-played.json fallback.')
}
