export type SpotifyStatus = {
  playing: boolean
  track: string
  artist: string
  album: string
  image: string
  url: string
  playedAt: string | null
}

export function loadSpotifyEnv(): void
export function hasSpotifyCredentials(): boolean
export function getSpotifyStatus(): Promise<SpotifyStatus | null>
export function onSpotifyTokenRotated(handler: (token: string) => void | Promise<void>): void
