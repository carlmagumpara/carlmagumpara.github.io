import { useEffect, useRef, useState } from 'react'

// Elements that make the cursor bloom into its "active" state.
const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input[type="button"]',
  'input[type="submit"]',
  'select',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[data-neon-hover]'
].join(', ')

// Over text fields the native I-beam is restored and the neon layer steps aside.
const TEXT_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])',
  'textarea',
  '[contenteditable="true"]'
].join(', ')

const isInteractive = (node) => node instanceof Element && Boolean(node.closest(INTERACTIVE_SELECTOR))
const isTextEntry = (node) => node instanceof Element && Boolean(node.closest(TEXT_SELECTOR))

/**
 * A glowing neon cursor with a fading trail and click ripples.
 *
 * Positions are written straight to the DOM inside one requestAnimationFrame
 * loop — React state is only used for the rare hover/visibility toggles, never
 * for pointer movement. The layer is pointer-events: none, so clicks and text
 * selection behave normally. It only mounts for fine pointers and is disabled
 * when the visitor prefers reduced motion.
 */
export default function NeonCursor({
  trailCount = 10,
  followEase = 0.32,
  trailEase = 0.24,
  className = '',
  style
}) {
  const coreRef = useRef(null)
  const haloRef = useRef(null)
  const dotsRef = useRef([])
  const ringsRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState(false)
  const [textMode, setTextMode] = useState(false)

  // Enable only for a real mouse and when motion is welcome. Preference
  // changes are handled live without remounting the rest of the site.
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches)

    update()
    finePointer.addEventListener('change', update)
    reducedMotion.addEventListener('change', update)
    return () => {
      finePointer.removeEventListener('change', update)
      reducedMotion.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const core = coreRef.current
    const halo = haloRef.current
    const rings = ringsRef.current
    const dots = dotsRef.current.filter(Boolean)
    if (!core || !halo || !rings) return undefined

    // Hide the native arrow while the effect runs; text fields opt back in.
    document.documentElement.classList.add('neon-cursor-active')

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const head = { x: pointer.x, y: pointer.y }
    const trail = dots.map(() => ({ x: pointer.x, y: pointer.y }))
    let frame = 0
    let primed = false

    const place = (element, x, y) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    const tick = () => {
      head.x += (pointer.x - head.x) * followEase
      head.y += (pointer.y - head.y) * followEase
      place(core, head.x, head.y)
      place(halo, head.x, head.y)

      // Each dot chases the one ahead of it, so the light tapers off gently.
      let leader = head
      trail.forEach((point, index) => {
        const ease = Math.max(0.06, trailEase - index * (trailEase / (trail.length * 1.5)))
        point.x += (leader.x - point.x) * ease
        point.y += (leader.y - point.y) * ease
        place(dots[index], point.x, point.y)
        leader = point
      })

      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(tick)
    }
    const stop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const onPointerMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY

      if (!primed) {
        // Avoid a streak across the screen when the pointer re-enters.
        head.x = pointer.x
        head.y = pointer.y
        trail.forEach((point) => {
          point.x = pointer.x
          point.y = pointer.y
        })
        primed = true
        setVisible(true)
      }
      start()
    }

    const onPointerOver = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      setHover(isInteractive(event.target))
      setTextMode(isTextEntry(event.target))
    }
    const onPointerOut = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      setHover(isInteractive(event.relatedTarget))
      setTextMode(isTextEntry(event.relatedTarget))
    }

    const onPointerDown = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return

      // A DOM ring per click keeps the animation off React's render path.
      const ring = document.createElement('span')
      ring.className = 'neon-cursor__ring'
      ring.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      ring.addEventListener('animationend', () => ring.remove(), { once: true })
      rings.appendChild(ring)

      core.classList.remove('neon-cursor__core--pulse')
      void core.offsetWidth // restart the animation on rapid clicks
      core.classList.add('neon-cursor__core--pulse')
    }

    const onPointerAway = () => {
      setVisible(false)
      primed = false
      stop()
    }
    const onVisibilityChange = () => {
      if (document.hidden) onPointerAway()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('blur', onPointerAway)
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })
    document.addEventListener('pointerleave', onPointerAway)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.documentElement.classList.remove('neon-cursor-active')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('blur', onPointerAway)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('pointerleave', onPointerAway)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stop()
      rings.replaceChildren()
    }
  }, [enabled, trailCount, followEase, trailEase])

  if (!enabled) return null

  return (
    <div
      className={`neon-cursor pointer-events-none fixed inset-0 overflow-hidden ${className}`}
      style={style}
      data-visible={visible}
      data-hover={hover}
      data-text={textMode}
      aria-hidden='true'
    >
      <div className='neon-cursor__trail'>
        {Array.from({ length: trailCount }, (_, index) => (
          <span
            key={index}
            ref={(element) => {
              dotsRef.current[index] = element
            }}
            className='neon-cursor__dot'
            style={{ '--trail-index': index }}
          />
        ))}
      </div>
      <span ref={haloRef} className='neon-cursor__halo' />
      <span ref={coreRef} className='neon-cursor__core' />
      <div ref={ringsRef} className='neon-cursor__rings' />
    </div>
  )
}
