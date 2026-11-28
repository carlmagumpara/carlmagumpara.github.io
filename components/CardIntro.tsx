import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLoaderDone } from './LoaderContext'

/**
 * First-load effect: a single fake cursor visits every card in turn, picks it
 * up and drags it into its real layout position. Runs on every full page load
 * once the splash loader has fully exited.
 */
const GRAB_INSET_X = 26
const GRAB_INSET_Y = 22

type Point = { x: number; y: number }

type InlineStyle = {
  position: string
  zIndex: string
  transform: string
  opacity: string
  willChange: string
}

type CardState = {
  el: HTMLElement
  rect: DOMRect
  prev: InlineStyle
  dx: number
  dy: number
  rotate: number
  scale: number
  start: Point
  end: Point
  travelMs: number
  dragMs: number
  gapMs: number
}

// useLayoutEffect on the client (so cards never paint in their final spot),
// useEffect during SSR to avoid React's server warning.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const lerpPoint = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Screen position of the cursor tip on a card under a given transform. */
function grabPoint(rect: DOMRect, dx: number, dy: number, rotate: number, scale: number): Point {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const lx = Math.min(GRAB_INSET_X, rect.width / 3) - rect.width / 2
  const ly = Math.min(GRAB_INSET_Y, rect.height / 3) - rect.height / 2
  const rad = (rotate * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: cx + dx + (lx * cos - ly * sin) * scale,
    y: cy + dy + (lx * sin + ly * cos) * scale,
  }
}

function restoreCard(card: CardState) {
  card.el.style.position = card.prev.position
  card.el.style.zIndex = card.prev.zIndex
  card.el.style.transform = card.prev.transform
  card.el.style.opacity = card.prev.opacity
  card.el.style.willChange = card.prev.willChange
}

export function CardIntro() {
  const loaderDone = useLoaderDone()
  const cursorRef = useRef<HTMLDivElement>(null)
  const statesRef = useRef<CardState[]>([])
  const rafRef = useRef(0)
  const frameResolveRef = useRef<(() => void) | null>(null)
  const cancelledRef = useRef(false)
  const startedRef = useRef(false)

  // Phase 1 — displace every card while the splash still covers the page.
  useIsomorphicLayoutEffect(() => {
    if (!cursorRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const content = document.querySelector('[data-page-content]')
    if (!content) return
    const cards = Array.from(content.querySelectorAll<HTMLElement>('.card'))
    if (cards.length === 0) return

    const compact = window.innerWidth < 640
    const states: CardState[] = cards.map((el, index) => {
      const rect = el.getBoundingClientRect()
      const prev: InlineStyle = {
        position: el.style.position,
        zIndex: el.style.zIndex,
        transform: el.style.transform,
        opacity: el.style.opacity,
        willChange: el.style.willChange,
      }

      const dx = (index % 2 === 0 ? 1 : -1) * (compact ? 45 : 80) * (1 + (index % 3) * 0.18)
      const dy = (compact ? 36 : 55) * (1 + (index % 4) * 0.16)
      const rotate = (index % 2 === 0 ? -1 : 1) * (1.2 + (index % 3) * 0.45)
      const scale = 0.96
      const start = grabPoint(rect, dx, dy, rotate, scale)
      const end = grabPoint(rect, 0, 0, 0, 1)
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight
      const dist = distance(start, end)

      el.style.position = 'relative'
      el.style.zIndex = '2'
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg) scale(${scale})`
      el.style.opacity = '0.55'
      el.style.willChange = 'transform, opacity'

      return {
        el,
        rect,
        prev,
        dx,
        dy,
        rotate,
        scale,
        start,
        end,
        travelMs: onScreen ? clamp(dist * 0.6, 220, 420) : 150,
        dragMs: onScreen ? clamp(dist * 0.9, 430, 720) : 240,
        gapMs: onScreen ? 100 : 40,
      }
    })

    statesRef.current = states
    return () => {
      states.forEach(restoreCard)
      statesRef.current = []
    }
  }, [])

  // Phase 2 — once the splash is gone, drag each card home one by one.
  useEffect(() => {
    if (!loaderDone || startedRef.current || statesRef.current.length === 0) return
    const currentCursor = cursorRef.current
    if (!currentCursor) return
    const cursorEl: HTMLDivElement = currentCursor
    startedRef.current = true
    cancelledRef.current = false

    const states = statesRef.current
    let pointer: Point = { x: window.innerWidth - 24, y: -40 }
    let dropTimer = 0
    // Cards scroll with the document while the cursor is fixed; keep them in sync.
    const startScrollY = window.scrollY
    let scrollDelta = 0
    const onScroll = () => {
      scrollDelta = window.scrollY - startScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const placeCursor = (p: Point) => {
      cursorEl.style.transform = `translate3d(${p.x}px, ${p.y - scrollDelta}px, 0)`
    }

    document.documentElement.classList.add('card-intro-active')
    placeCursor(pointer)
    cursorEl.dataset.visible = 'true'

    const animate = (
      duration: number,
      easing: (t: number) => number,
      onFrame: (t: number) => void
    ) =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now()
        frameResolveRef.current = resolve
        function tick(now: number) {
          if (cancelledRef.current) return resolve()
          const t = duration <= 0 ? 1 : Math.min(1, (now - startedAt) / duration)
          onFrame(easing(t))
          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            frameResolveRef.current = null
            resolve()
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      })

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms)
      })

    const pulseDrop = () => {
      window.clearTimeout(dropTimer)
      // Toggle off + reflow so the ring animation restarts for every card.
      cursorEl.dataset.drop = 'false'
      void cursorEl.offsetWidth
      cursorEl.dataset.drop = 'true'
      dropTimer = window.setTimeout(() => {
        cursorEl.dataset.drop = 'false'
      }, 300)
    }

    async function run() {
      for (const card of states) {
        if (cancelledRef.current) break
        if (!card.el.isConnected) {
          restoreCard(card)
          continue
        }

        // Move to the card's displaced position.
        await animate(card.travelMs, easeInOut, (t) => {
          placeCursor(lerpPoint(pointer, card.start, t))
        })
        if (cancelledRef.current) break

        // Drag cursor and card together with identical easing so they stay attached.
        cursorEl.dataset.grabbing = 'true'
        await animate(card.dragMs, easeOut, (t) => {
          const dx = card.dx * (1 - t)
          const dy = card.dy * (1 - t)
          const rotate = card.rotate * (1 - t)
          const scale = 1 + (card.scale - 1) * (1 - t)
          card.el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg) scale(${scale})`
          card.el.style.opacity = String(lerp(0.55, 1, t))
          placeCursor(grabPoint(card.rect, dx, dy, rotate, scale))
        })
        if (cancelledRef.current) break

        restoreCard(card)
        cursorEl.dataset.grabbing = 'false'
        pulseDrop()
        pointer = card.end
        await sleep(card.gapMs)
      }
    }

    void run().then(() => {
      window.removeEventListener('scroll', onScroll)
      if (cancelledRef.current) return
      cursorEl.dataset.visible = 'false'
      cursorEl.dataset.drop = 'false'
      document.documentElement.classList.remove('card-intro-active')
      statesRef.current = []
    })

    return () => {
      cancelledRef.current = true
      cancelAnimationFrame(rafRef.current)
      frameResolveRef.current?.()
      frameResolveRef.current = null
      window.clearTimeout(dropTimer)
      window.removeEventListener('scroll', onScroll)
      states.forEach(restoreCard)
      statesRef.current = []
      cursorEl.dataset.visible = 'false'
      cursorEl.dataset.grabbing = 'false'
      cursorEl.dataset.drop = 'false'
      document.documentElement.classList.remove('card-intro-active')
    }
  }, [loaderDone])

  return (
    <div
      ref={cursorRef}
      className="card-intro-cursor"
      data-visible="false"
      data-grabbing="false"
      aria-hidden="true"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 2 L4 22 L9.5 16.5 L13 23 L16.5 21.2 L13 14.8 L20 14 Z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
