import { useEffect, useState } from 'react'
import lastPlayedData from '../data/last-played.json'
import { apiUrl } from '../lib/api'

type LastPlayed = {
  track: string
  artist: string
  album: string
  image: string
  url: string
  playedAt: string | null
}

type SpotifyStatus = LastPlayed & { playing: boolean }

const lastPlayed = lastPlayedData as LastPlayed

export function LastPlayedBanner() {
  const [status, setStatus] = useState<SpotifyStatus>({ ...lastPlayed, playing: false })

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      try {
        const response = await fetch(apiUrl('/api/spotify'), { cache: 'no-store' })
        if (!response.ok) return

        const live = (await response.json()) as SpotifyStatus | null
        if (mounted && live?.track) setStatus(live)
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
    <section className="card overflow-hidden sm:col-span-2">
      <a
        href={status.url}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-4 overflow-hidden p-4 sm:p-5"
        aria-label={`${status.playing ? 'Now playing' : 'Last played'} on Spotify: ${status.track} by ${status.artist}`}
      >
        <img
          src={status.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative min-w-0 flex-1 text-white">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90">
              ▶ Spotify
            </span>
            <span className="label-eyebrow text-[10px] text-white/70">
              {status.playing ? 'Now playing' : 'Last played'}
            </span>
          </div>
          <p className="truncate text-base font-semibold sm:text-lg">{status.track}</p>
          <p className="truncate text-xs text-white/75 sm:text-sm">{status.artist}</p>
        </div>

        <img
          src={status.image}
          alt={status.album ? `${status.album} album art` : 'Album art'}
          className="relative h-14 w-14 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16"
        />
      </a>
    </section>
  )
}
