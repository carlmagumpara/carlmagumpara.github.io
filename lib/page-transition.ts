// A 3D box page transition for Vike's lifecycle hooks.
//
// The page being left is snapshotted into a fixed "stage" that sits above the
// live content. Once Vike has rendered the next route, that snapshot and a
// snapshot of the new page become two adjacent faces of a CSS 3D box. Rotating
// the box 90° around its vertical axis brings the next page to the front — it
// looks like one face of a box swinging away to reveal the face behind it.
//
// The real [data-page-content] node is never moved or replaced; it is only
// hidden while the stage covers it, so React/Vike stay in control of the DOM.

const ROTATION_MS = 720
const SAFETY_TIMEOUT_MS = 3000
const EASING = 'cubic-bezier(0.76, 0, 0.24, 1)'

// -1 = forward: turn left, revealing the face on the right.
//  1 = backward: turn right, revealing the face on the left.
type Direction = -1 | 1

let direction: Direction = -1
let safetyTimer: number | undefined
let stage: HTMLElement | null = null
let liveContent: HTMLElement | null = null

function getContent(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.querySelector<HTMLElement>('[data-page-content]')
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Remove the stage and restore the live page to its normal visible state. */
function cleanup(): void {
  if (typeof window === 'undefined') return
  window.clearTimeout(safetyTimer)
  safetyTimer = undefined

  if (stage) {
    stage.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())
    stage.remove()
    stage = null
  }
  if (liveContent) {
    liveContent.style.visibility = ''
    liveContent = null
  }
}

/**
 * Clone the routed content into a box face. The clone is offset by the current
 * scroll position so it aligns with what the visitor was actually looking at.
 */
function makeFace(source: HTMLElement, transform: string, scrollY: number) {
  const face = document.createElement('div')
  face.className = 'box-face'
  face.style.transform = transform
  face.setAttribute('aria-hidden', 'true')

  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('data-page-content')
  clone.classList.add('box-face__content')
  clone.style.visibility = 'visible' // the live node may be hidden at this point
  clone.style.transform = `translateY(${-scrollY}px)`
  clone.setAttribute('aria-hidden', 'true')
  clone.setAttribute('inert', '')
  face.appendChild(clone)

  // A light/shadow gradient adds depth as the face turns away or comes forward.
  const shade = document.createElement('div')
  shade.className = 'box-face__shade'
  face.appendChild(shade)

  return { face, shade }
}

/**
 * Take the snapshot of the current page before Vike swaps in the next one.
 * Nothing visibly moves yet — the snapshot simply covers the live content —
 * so the actual rotation can run with both faces present in endBoxTransition.
 */
export function beginBoxTransition(isBackwardNavigation?: boolean | null): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve()

  // A previous transition may still be running (rapid clicks / aborted nav).
  cleanup()

  // Leaving home moves forward into a section; any other origin (or a browser
  // Back action, including "← Back to home") turns the box the other way.
  const isBackward = Boolean(isBackwardNavigation) || window.location.pathname !== '/'
  direction = isBackward ? 1 : -1

  const content = getContent()
  if (!content || prefersReducedMotion()) return Promise.resolve()

  const scrollY = window.scrollY
  liveContent = content
  content.style.visibility = 'hidden'

  const stageElement = document.createElement('div')
  stageElement.className = 'box-transition-stage'
  const box = document.createElement('div')
  box.className = 'box-transition-box'
  stageElement.appendChild(box)
  document.body.appendChild(stageElement)
  stage = stageElement

  // Half the viewport width is the centre-to-face distance of a box whose
  // front face fills the screen, so adjacent faces meet without a gap. The
  // matching negative offset keeps that face at 1:1 scale on the screen plane.
  const halfDepth = window.innerWidth / 2
  box.style.transform = `translateZ(${-halfDepth}px)`
  const { face } = makeFace(content, `translateZ(${halfDepth}px)`, scrollY)
  box.appendChild(face)

  // If the end hook never arrives, make sure the page can't stay hidden.
  // Check identity so a stale timer can never tear down a newer transition.
  const capturedStage = stageElement
  safetyTimer = window.setTimeout(() => {
    if (stage === capturedStage) cleanup()
  }, SAFETY_TIMEOUT_MS)
  return Promise.resolve()
}

/** Rotate the box so the freshly rendered page becomes the front face. */
export function endBoxTransition(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  window.clearTimeout(safetyTimer)
  safetyTimer = undefined

  const content = getContent()
  if (!stage || !content || prefersReducedMotion()) {
    cleanup()
    return
  }

  const capturedStage = stage
  const box = stage.querySelector<HTMLElement>('.box-transition-box')
  const outgoingFace = box?.querySelector<HTMLElement>('.box-face')
  const outgoingShade = outgoingFace?.querySelector<HTMLElement>('.box-face__shade')
  if (!box || !outgoingFace || !outgoingShade) {
    cleanup()
    return
  }

  const halfDepth = window.innerWidth / 2
  // Forward reveals the right face; backward reveals the left face.
  const incomingTransform =
    direction === -1
      ? `rotateY(90deg) translateZ(${halfDepth}px)`
      : `rotateY(-90deg) translateZ(${halfDepth}px)`
  const targetRotation = direction === -1 ? -90 : 90

  const { face: incomingFace, shade: incomingShade } = makeFace(content, incomingTransform, window.scrollY)
  box.appendChild(incomingFace)

  const options: KeyframeAnimationOptions = {
    duration: ROTATION_MS,
    easing: EASING,
    fill: 'forwards'
  }

  // Pull the box back by half its depth so the face currently at the front
  // sits on the screen plane (no perspective zoom); the incoming face swings
  // into that same plane as the box turns. Both faces ride on the same box,
  // so the rotation reads as one solid object.
  const base = `translateZ(${-halfDepth}px)`
  const spin = box.animate(
    [
      { transform: `${base} rotateY(0deg) scale(1)` },
      { transform: `${base} rotateY(${targetRotation / 2}deg) scale(0.96)` },
      { transform: `${base} rotateY(${targetRotation}deg) scale(1)` }
    ],
    options
  )
  outgoingShade.animate([{ opacity: 0 }, { opacity: 0.55 }], options)
  incomingShade.animate([{ opacity: 0.65 }, { opacity: 0 }], options)

  // A rapid second navigation cancels this animation; don't let its rejected
  // promise clean up the *new* stage that replaced this one.
  const finish = () => {
    if (stage === capturedStage) cleanup()
  }
  void spin.finished.then(finish, finish)
}
