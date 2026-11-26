import { useEffect, useState } from 'react'
import { FaUsers } from 'react-icons/fa'
import githubData from '../data/github.json'

type GithubProfile = {
  username: string
  followers: number
  following: number
  publicRepos: number
  url: string
}

const fallback = githubData as GithubProfile

export function GitHubFollowers() {
  const [profile, setProfile] = useState<GithubProfile>(fallback)

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      try {
        const response = await fetch('/api/github', { cache: 'no-store' })
        if (!response.ok) return

        const live = (await response.json()) as GithubProfile | null
        if (mounted && typeof live?.followers === 'number') setProfile(live)
      } catch {
        // Keep the build-time fallback if the API isn't available.
      }
    }

    void refresh()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className="mt-3 flex items-center">
      <a
        href={`${profile.url}?tab=followers`}
        target="_blank"
        rel="noreferrer"
        className="badge cursor-pointer gap-1.5 hover:opacity-100"
        aria-label={`${profile.followers} GitHub followers — view followers`}
      >
        <FaUsers aria-hidden="true" />
        <span className="font-semibold tabular-nums">{profile.followers.toLocaleString()}</span>
        <span>followers</span>
      </a>
    </div>
  )
}
