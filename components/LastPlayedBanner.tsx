import lastPlayedData from '../data/last-played.json'

type LastPlayed = {
  track: string
  artist: string
  album: string
  image: string
  url: string
  playedAt: string | null
}

const lastPlayed = lastPlayedData as LastPlayed

export function LastPlayedBanner() {
  return (
    <section className="card overflow-hidden sm:col-span-2">
      <a
        href={lastPlayed.url}
        target="_blank"
        rel="noreferrer"
        className="group relative block aspect-[3/1] w-full overflow-hidden sm:aspect-[4/1]"
        aria-label={`Last played on Spotify: ${lastPlayed.track} by ${lastPlayed.artist}`}
      >
        <img
          src={lastPlayed.image}
          alt={lastPlayed.album ? `${lastPlayed.album} album art` : 'Album art'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent" />

        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          ▶ Spotify
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Last played</p>
          <p className="truncate text-base font-semibold sm:text-lg">{lastPlayed.track}</p>
          <p className="truncate text-xs text-white/75 sm:text-sm">{lastPlayed.artist}</p>
        </div>
      </a>
    </section>
  )
}
