import { usePresence } from './LivePresence'

/**
 * All-time and daily unique visitor counts. The provider keeps these fresh via
 * the shared presence socket, so the badge updates as other people arrive.
 */
export function UniqueVisitors() {
  const { visitorStats } = usePresence()
  if (!visitorStats) return null

  return (
    <div className="unique-visitor-badge" role="status" aria-live="polite" title="Unique visitors">
      <span>{visitorStats.total.toLocaleString()} unique visitors</span>
      <span className="visitor-stat-divider" aria-hidden="true">
        ·
      </span>
      <span>{visitorStats.today.toLocaleString()} today</span>
    </div>
  )
}
