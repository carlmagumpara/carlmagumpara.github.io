import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLoaderDone } from './LoaderContext'

type CountUpProps = {
  /** The final, integer count to animate to. */
  value: number
  /** Animation length in milliseconds. */
  duration?: number
}

// Layout effects keep the first frame at zero on the client without causing a
// server-render mismatch; SSR falls back to a regular effect.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Holds at the final value until the splash loader is gone, then counts up
 * from zero. Later value changes animate from the number currently displayed.
 * Honors reduced-motion preferences.
 */
export function CountUp({ value, duration = 1200 }: CountUpProps) {
  const loaderDone = useLoaderDone()
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)
  const animatedRef = useRef(false)
  const frameRef = useRef<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    // Keep counts correct behind the overlay, but don't start animating yet.
    if (!loaderDone) {
      displayRef.current = value
      setDisplay(value)
      return
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayRef.current = value
      setDisplay(value)
      return
    }

    const firstRun = !animatedRef.current
    const from = firstRun ? 0 : displayRef.current
    animatedRef.current = true

    if (firstRun) {
      displayRef.current = from
      setDisplay(from)
    }
    if (from === value) return

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const next = from + (value - from) * eased
      displayRef.current = next
      setDisplay(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [loaderDone, value, duration])

  const formatted = Math.round(display).toLocaleString()

  return (
    <>
      {/* Animated digits are hidden from AT so live regions don't announce every frame. */}
      <span aria-hidden="true">{formatted}</span>
      <span className="sr-only">{Math.round(value).toLocaleString()}</span>
    </>
  )
}
