import { getGithubProfile } from '../lib/github.mjs'

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Reuse cached data briefly to stay well inside GitHub's rate limit.
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')

  try {
    response.status(200).json(await getGithubProfile())
  } catch (error) {
    console.error('[github] API error:', error)
    response.status(503).json({ error: 'GitHub data is unavailable' })
  }
}
