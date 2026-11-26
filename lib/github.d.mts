export type GithubProfile = {
  username: string
  followers: number
  following: number
  publicRepos: number
  url: string
}

export function loadGithubEnv(): void
export function normalizeProfile(data: Record<string, unknown>): GithubProfile
export function getGithubProfile(options?: { force?: boolean }): Promise<GithubProfile>
