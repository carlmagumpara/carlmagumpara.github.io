import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { defineConfig, type ViteDevServer } from 'vite'
import { getSpotifyStatus } from './lib/spotify.mjs'
import { getGithubProfile } from './lib/github.mjs'

// Vercel serves /api/spotify in production; this mirrors it for `vite dev`.
function spotifyApiDev() {
  return {
    name: 'spotify-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/spotify', async (_request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.setHeader('Cache-Control', 'private, no-store')

        try {
          response.end(JSON.stringify(await getSpotifyStatus()))
        } catch (error) {
          response.statusCode = 503
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Spotify unavailable' }))
        }
      })
    }
  }
}

// Vercel serves /api/github in production; this mirrors it for `vite dev`.
function githubApiDev() {
  return {
    name: 'github-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/github', async (_request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')

        try {
          response.end(JSON.stringify(await getGithubProfile()))
        } catch (error) {
          response.statusCode = 503
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'GitHub unavailable' }))
        }
      })
    }
  }
}

export default defineConfig({
  // This repo is the user site (carlmagumpara.github.io), so Pages serves it at
  // the domain root. Keep absolute asset URLs pointing at "/" in production.
  base: '/',
  plugins: [react(), tailwindcss(), vike(), spotifyApiDev(), githubApiDev()]
})
