import { useEffect, useState } from 'react'

/** Emitted by ThemeToggle whenever the theme changes; detail is the new theme. */
export const THEME_CHANGE_EVENT = 'theme-change'
/** Emitted by HeartButton whenever a heart is sent. */
export const HEART_BURST_EVENT = 'heart-burst'

type Theme = 'light' | 'dark'
type Effect = 'sun' | 'moon' | 'heart'
type Zoom = { id: number; effect: Effect }

// Slightly longer than the CSS animation so the overlay is never cut off early.
const OVERLAY_DURATION = 900
const nextId = () => Date.now() + Math.random()

/** Full-screen sun/moon/heart zoom played after theme toggles and heart sends. */
export function ZoomEffects() {
  const [zoom, setZoom] = useState<Zoom | null>(null)

  useEffect(() => {
    function onThemeChange(event: Event) {
      const theme = (event as CustomEvent<Theme>).detail
      if (theme !== 'light' && theme !== 'dark') return
      setZoom({ id: nextId(), effect: theme === 'light' ? 'sun' : 'moon' })
    }
    function onHeartBurst() {
      setZoom({ id: nextId(), effect: 'heart' })
    }

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)
    window.addEventListener(HEART_BURST_EVENT, onHeartBurst)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
      window.removeEventListener(HEART_BURST_EVENT, onHeartBurst)
    }
  }, [])

  useEffect(() => {
    if (!zoom) return
    const timer = window.setTimeout(() => setZoom(null), OVERLAY_DURATION)
    return () => window.clearTimeout(timer)
  }, [zoom])

  if (!zoom) return null

  return (
    <div
      key={zoom.id}
      className="zoom-effect"
      data-effect={zoom.effect}
      aria-hidden="true"
    >
      <img
        className="zoom-effect__image"
        src={`${import.meta.env.BASE_URL}${zoom.effect}.svg`}
        alt=""
      />
    </div>
  )
}
