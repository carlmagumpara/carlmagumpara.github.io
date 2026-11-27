// Shared helpers for the Vike page-transition hooks. The routed content is
// animated horizontally while the fixed controls in +Layout stay in place.
const SLIDE_OUT_MS = 200
const SLIDE_IN_MS = 220
const SAFETY_TIMEOUT_MS = 1000

let safetyTimer: number | undefined
let slideDirection: -1 | 1 = -1 // -1 = forward (out left / in from right)

function getContent(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.querySelector<HTMLElement>('[data-page-content]')
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Slide the current page out of view, then let Vike render the next one.
 * Forward navigation exits left; going back exits right.
 */
export function beginPageSlide(isBackwardNavigation?: boolean | null): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  // Leaving the home page means moving forward into a section. Any other
  // starting route (or a browser Back action) is treated as going back, which
  // also covers the "← Back to home" link in SectionPage.
  const isBackward = Boolean(isBackwardNavigation) || window.location.pathname !== '/'
  slideDirection = isBackward ? 1 : -1

  if (prefersReducedMotion()) {
    endPageSlide()
    return Promise.resolve()
  }

  const el = getContent()
  if (!el) return Promise.resolve()

  // Cancel any still-running transition before starting a new one (e.g. a
  // rapid second click) so animations don't stack on the same element.
  el.getAnimations().forEach((animation) => animation.cancel())

  const exitX = slideDirection === -1 ? '-100%' : '100%'
  const outgoing = el.animate(
    [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: `translateX(${exitX})`, opacity: 0 }
    ],
    { duration: SLIDE_OUT_MS, easing: 'ease-in', fill: 'forwards' }
  )

  // If navigation is aborted (e.g. a rapid second click), no end hook runs.
  // Clear the held transform eventually so the page can never stay hidden.
  window.clearTimeout(safetyTimer)
  safetyTimer = window.setTimeout(endPageSlide, SAFETY_TIMEOUT_MS)

  // `finished` rejects when the animation is cancelled by endPageSlide or the
  // safety timeout; either way the outgoing phase is over.
  return outgoing.finished.then(
    () => undefined,
    () => undefined
  )
}

/** Slide the freshly rendered page in from the opposite side. */
export function endPageSlide(): void {
  if (typeof window === 'undefined') return
  window.clearTimeout(safetyTimer)
  safetyTimer = undefined

  const el = getContent()
  // Drop the held exit transform before animating the new content in.
  el?.getAnimations().forEach((animation) => animation.cancel())

  if (!el || prefersReducedMotion()) return

  const enterX = slideDirection === -1 ? '100%' : '-100%'
  el.animate(
    [
      { transform: `translateX(${enterX})`, opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ],
    { duration: SLIDE_IN_MS, easing: 'ease-out' }
  )
}
