// Tiny store shared by the card-drag intro and anything that should start
// afterwards (currently the typewriter bio). A module-level store avoids
// missing an update if the intro finishes before a listener mounts.

type Listener = () => void

const listeners = new Set<Listener>()
const doneCards = new Set<string>()
let introDone = false

function notify() {
  listeners.forEach((listener) => listener())
}

/** Called by CardIntro as soon as a card lands in its final position. */
export function markCardDone(key: string | null) {
  if (key) doneCards.add(key)
  notify()
}

/** Called when the whole drag sequence finishes (or is skipped). */
export function markIntroDone() {
  introDone = true
  notify()
}

export function isCardDone(key: string): boolean {
  return introDone || doneCards.has(key)
}

export function subscribeIntro(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
