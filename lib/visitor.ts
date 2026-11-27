const VISITOR_ID_KEY = 'visitor:id'
const VALID_ID = /^[A-Za-z0-9_-]{8,64}$/

/** Counts returned by /api/visitors and shared over the presence socket. */
export type VisitorStats = { total: number; today: number }

/**
 * A stable, per-browser identifier used only for counting unique visitors.
 * Kept separate from the session-scoped `cursor:id` used by live presence.
 */
export function getVisitorId(): string {
  let id = ''
  try {
    id = localStorage.getItem(VISITOR_ID_KEY) ?? ''
  } catch {
    // Storage can be unavailable in private browsing.
  }

  if (!VALID_ID.test(id)) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    try {
      localStorage.setItem(VISITOR_ID_KEY, id)
    } catch {
      // An ephemeral id still counts once for this session.
    }
  }

  return id
}
