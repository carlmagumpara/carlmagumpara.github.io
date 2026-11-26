import { useEffect, useState } from 'react'
import lastPlayedData from '../data/last-played.json'

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
        const response = await fetch('/api/spotify', { cache: 'no-store' })
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
        className="group relative block aspect-[3/1] w-full overflow-hidden sm:aspect-[4/1]"
        aria-label={`${status.playing ? 'Now playing' : 'Last played'} on Spotify: ${status.track} by ${status.artist}`}
      >
        <img
          src={status.image}
          alt={status.album ? `${status.album} album art` : 'Album art'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent" />

        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          ▶ Spotify
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
            {status.playing ? 'Now playing' : 'Last played'}
          </p>
          <p className="truncate text-base font-semibold sm:text-lg">{status.track}</p>
          <p className="truncate text-xs text-white/75 sm:text-sm">{status.artist}</p>
        </div>
      </a>
    </section>
  )
}
