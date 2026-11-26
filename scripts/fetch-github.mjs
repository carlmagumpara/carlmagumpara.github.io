import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getGithubProfile } from '../lib/github.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(root, 'data', 'github.json')

try {
  const profile = await getGithubProfile({ force: true })
  await writeFile(outputFile, `${JSON.stringify(profile, null, 2)}\n`)
  console.log(`[github] ${profile.username}: ${profile.followers} followers`)
} catch (error) {
  console.warn(`[github] Could not update follower count: ${error.message}`)
  console.warn('[github] Keeping the existing data/github.json fallback.')
}
