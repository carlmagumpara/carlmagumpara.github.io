// Shared helpers for the Vike page-transition hooks. The attribute is toggled
// on <body> so CSS can fade only the routed content (not the fixed controls).
const FADE_OUT_MS = 100
const SAFETY_TIMEOUT_MS = 1000

let safetyTimer: number | undefined

/** Fade the current page out, then let Vike render the next one. */
export function beginPageFade(): Promise<void> {
  if (typeof document === 'undefined' || typeof window === 'undefined') return Promise.resolve()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    endPageFade()
    return Promise.resolve()
  }

  document.body.dataset.pageTransition = 'out'
  // If a navigation is aborted (e.g. a rapid second click), no end hook will
  // run. Clear the attribute eventually so the page can never stay hidden.
  window.clearTimeout(safetyTimer)
  safetyTimer = window.setTimeout(endPageFade, SAFETY_TIMEOUT_MS)

  return new Promise((resolve) => window.setTimeout(resolve, FADE_OUT_MS))
}

/** Restore the page opacity once the new page has rendered. */
export function endPageFade(): void {
  if (typeof document === 'undefined') return
  window.clearTimeout(safetyTimer)
  safetyTimer = undefined
  delete document.body.dataset.pageTransition
}
