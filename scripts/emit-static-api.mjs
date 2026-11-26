import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, 'dist', 'client', 'api')

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

const [lastPlayed, github] = await Promise.all([
  readJson('data/last-played.json'),
  readJson('data/github.json')
])

await mkdir(apiDir, { recursive: true })

// Static mirrors of the Vercel serverless endpoints. GitHub Pages has no
// server runtime, so these are build-time snapshots of the same data.
await writeFile(
  path.join(apiDir, 'spotify'),
  `${JSON.stringify({ ...lastPlayed, playing: false }, null, 2)}\n`
)
await writeFile(
  path.join(apiDir, 'github'),
  `${JSON.stringify(github, null, 2)}\n`
)

console.log('[static-api] Wrote dist/client/api/spotify and dist/client/api/github')
