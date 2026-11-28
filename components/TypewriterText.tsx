import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { isCardDone, subscribeIntro } from '../lib/intro-state'

/**
 * Reveals text one character at a time once its card has been dropped into
 * place. The invisible copy reserves the final height so nothing shifts while
 * it types, and reduced-motion users see the full text straight away.
 */
export function TypewriterText({
  text,
  introKey,
  speed = 16
}: {
  text: string
  introKey: string
  speed?: number
}) {
  // Start with the full text so SSR (and no-JS) renders the real bio.
  const [count, setCount] = useState(text.length)
  const getSnapshot = useCallback(() => isCardDone(introKey), [introKey])
  const start = useSyncExternalStore(subscribeIntro, getSnapshot, () => false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // The splash still covers the page at this point, so hide without flashing.
    setCount(0)
  }, [])

  useEffect(() => {
    if (!start) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length)
      return
    }

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setCount(index)
      if (index >= text.length) window.clearInterval(timer)
    }, speed)
    return () => window.clearInterval(timer)
  }, [start, text, speed])

  return (
    <span className="typewriter">
      <span className="typewriter-ghost" aria-hidden="true">{text}</span>
      <span className="typewriter-text">
        {text.slice(0, count)}
        {count < text.length && <span className="typewriter-caret" aria-hidden="true" />}
      </span>
    </span>
  )
}
