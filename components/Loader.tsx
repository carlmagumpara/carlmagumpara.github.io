import { useEffect, useState } from 'react'

// Total time the splash stays on screen (ms) and the length of its exit fade.
const LOAD_DURATION = 3000
const EXIT_DURATION = 450

export function Loader() {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [removed, setRemoved] = useState(false)

  // Lock scrolling only while the splash is actually on screen. When `removed`
  // flips to true this effect's cleanup runs and restores the page scrollbar —
  // the component itself stays mounted, so a cleanup on the timer effect below
  // would never fire on load completion.
  useEffect(() => {
    if (removed) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [removed])

  useEffect(() => {
    let frame = 0
    let start: number | null = null
    let exitTimer = 0

    function tick(time: number) {
      if (start === null) start = time
      const elapsed = time - start
      setProgress(Math.min(100, Math.round((elapsed / LOAD_DURATION) * 100)))

      if (elapsed < LOAD_DURATION) {
        frame = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        exitTimer = window.setTimeout(() => setRemoved(true), EXIT_DURATION)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(exitTimer)
    }
  }, [])

  if (removed) return null

  return (
    <div
      className="loader-overlay"
      data-leaving={leaving}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="loader-content">
        <div className="loader-visual">
          <div className="loader-orbit" aria-hidden="true" />
          <div className="loader-ring" aria-hidden="true">
            <div className="loader-ring-inner">
              <img src="/avatar.jpg" alt="" className="loader-avatar" />
            </div>
          </div>
        </div>

        <p className="loader-percent brand-text">
          {progress}<span>%</span>
        </p>

        <div
          className="loader-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
        >
          <div className="loader-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="loader-label">Loading portfolio</p>
      </div>
    </div>
  )
}
