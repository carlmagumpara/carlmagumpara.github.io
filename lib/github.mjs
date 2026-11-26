import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CACHE_TTL_MS = 5 * 60 * 1000
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { githubUsername } = JSON.parse(readFileSync(path.join(root, 'config.json'), 'utf8'))

let cachedProfile = null
let cachedAt = 0

export function loadGithubEnv() {
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

function getUsername() {
  loadGithubEnv()
  return process.env.GITHUB_USERNAME || githubUsername
}

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-v2'
  }

  // Optional: a token raises the rate limit from 60 to 5,000 requests/hour.
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}

export function normalizeProfile(data) {
  return {
    username: data.login,
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    url: data.html_url
  }
}

export async function getGithubProfile({ force = false } = {}) {
  if (!force && cachedProfile && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedProfile
  }

  const username = getUsername()
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${await response.text()}`)
  }

  cachedProfile = normalizeProfile(await response.json())
  cachedAt = Date.now()
  return cachedProfile
}
