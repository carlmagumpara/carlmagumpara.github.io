import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'
import { getVisitorId } from '../lib/visitor'

type VisitorStats = { total: number; today: number }

// One request per client-side navigation session; a full reload starts a new
// one, which the server deduplicates via the persistent visitor id.
let requested = false

/** All-time and daily unique visitor counts, persisted in Upstash Redis. */
export function UniqueVisitors() {
  const [stats, setStats] = useState<VisitorStats | null>(null)

  useEffect(() => {
    if (requested || typeof window === 'undefined') return
    requested = true

    fetch(apiUrl('/api/visitors'), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: getVisitorId(),
      keepalive: true
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: VisitorStats) => {
        if (typeof data?.total !== 'number' || typeof data?.today !== 'number') {
          throw new Error('Invalid response')
        }
        setStats({ total: data.total, today: data.today })
      })
      .catch(() => {
        // The badge stays hidden if the counter is unavailable.
      })
  }, [])

  if (!stats) return null

  return (
    <div className="unique-visitor-badge" role="status" aria-live="polite" title="Unique visitors">
      <span>{stats.total.toLocaleString()} unique visitors</span>
      <span className="visitor-stat-divider" aria-hidden="true">
        ·
      </span>
      <span>{stats.today.toLocaleString()} today</span>
    </div>
  )
}
